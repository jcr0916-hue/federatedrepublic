"""Loopback-only receiver checks with synthetic credentials; no cloud requests."""
import contextlib
import http.client
import importlib.util
import io
import json
from pathlib import Path
import re
import socket
import subprocess
import sys
import tempfile
import time
import urllib.parse
from unittest.mock import patch

SOURCE = Path(__file__).with_name('current-mac-receiver.py')
BOOTSTRAP = '''
import importlib.util, pathlib, sys
spec=importlib.util.spec_from_file_location('receiver_under_test',sys.argv[1])
receiver=importlib.util.module_from_spec(spec);spec.loader.exec_module(receiver)
receiver.ROOT=pathlib.Path(sys.argv[2]);receiver.PRIVATE=receiver.ROOT/'.private'
receiver.CREDS=receiver.PRIVATE/'current-credentials.json'
receiver.PENDING=receiver.PRIVATE/'current-grant-pending.json'
receiver.PORT=int(sys.argv[3])
def no_network(*args,**kwargs):raise RuntimeError('Cloud requests are forbidden in this check')
receiver.send=no_network
sys.argv=[str(spec.origin),'--exercise','replay'];receiver.main()
'''


def check_cleanup(root, credentials, check):
    spec = importlib.util.spec_from_file_location('receiver_cleanup_test', SOURCE)
    receiver = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(receiver)

    class EmptySuccess:
        status = 200

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def read(self, *args):
            return b''

    with patch.object(receiver.OPENER, 'open', return_value=EmptySuccess()):
        check(receiver.send(receiver.ISSUER + '/revoke') == (200, {}), 'Empty HTTP 200 must be accepted for revocation')
        try:
            receiver.send(receiver.ISSUER + '/introspect')
        except json.JSONDecodeError:
            check(True, 'Introspection still requires a JSON response')
        else:
            raise AssertionError('Empty introspection must fail closed')

    receiver.ROOT = root / 'cleanup'
    receiver.PRIVATE = receiver.ROOT / '.private'
    receiver.PRIVATE.mkdir(mode=0o700, parents=True)
    receiver.CREDS = receiver.PRIVATE / 'current-credentials.json'
    receiver.PENDING = receiver.PRIVATE / 'current-grant-pending.json'
    (receiver.ROOT / 'workers/newsroom/release').mkdir(parents=True)
    receiver.save_private(receiver.CREDS, credentials)
    pair = {'access_token': 'synthetic-access', 'refresh_token': 'synthetic-refresh'}
    successor = {'access_token': 'synthetic-next-access', 'refresh_token': 'synthetic-next-refresh'}
    marker = {'uncertain': True, 'newDisposableOnly': True, 'knownTokens': [pair]}
    calls = []

    def closed_grant(url, fields, **kwargs):
        route = urllib.parse.urlsplit(url).path
        calls.append(route)
        if route == '/revoke':
            return 200, {}
        if route == '/introspect':
            return 200, {'active': False}
        return 400, {'error': 'invalid_grant'}

    receiver.save_private(receiver.PENDING, marker)
    with patch.object(sys, 'argv', [str(SOURCE), '--exercise', 'cleanup']), contextlib.redirect_stdout(io.StringIO()):
        with patch.object(receiver, 'send', side_effect=closed_grant):
            receiver.main()
        check(calls == ['/revoke', '/introspect', '/token'] and not receiver.PENDING.exists(),
              'Cleanup clears its marker only after revocation and both inactivity checks')

        receiver.save_private(receiver.PENDING, marker)
        with patch.object(receiver, 'send', side_effect=[(200, {}), (200, {'active': False}), (200, successor)]):
            try:
                receiver.main()
            except SystemExit as error:
                saved = json.loads(receiver.PENDING.read_text())
                check(error.code == 1 and saved['knownTokens'] == [pair, successor],
                      'An unexpected refresh success preserves both pairs for follow-up')
            else:
                raise AssertionError('Unexpected refresh success must leave cleanup unresolved')


def main():
    checks = 0

    def check(ok, label):
        nonlocal checks
        if not ok:
            raise AssertionError(label)
        checks += 1

    with tempfile.TemporaryDirectory(prefix='newsroom-loopback-check-') as temp:
        root = Path(temp)
        private = root / '.private'
        private.mkdir(mode=0o700)
        credentials = {
            'issuer': 'https://newsroom-current-issuer-20261109.jcr0916.workers.dev',
            'audience': 'https://newsroom-current-resource-20261109.jcr0916.workers.dev/mcp',
            'client_id': 'newsroom-current-client-20261109',
            'validator_id': 'newsroom-current-validator-20261109',
            'redirect_uri': 'https://newsroom-current-client-20261109.jcr0916.workers.dev/callback',
            'oauth_client_secret': 'SYNTHETIC-LOCAL-CHECK-ONLY-CLIENT-00000000',
            'resource_validator_secret': 'SYNTHETIC-LOCAL-CHECK-ONLY-VALIDATOR-00000',
        }
        check_cleanup(root, credentials, check)
        path = private / 'current-credentials.json'
        path.write_text(json.dumps(credentials))
        path.chmod(0o600)
        with socket.socket() as reservation:
            reservation.bind(('127.0.0.1', 0))
            port = reservation.getsockname()[1]
        origin = 'http://127.0.0.1:' + str(port)
        process = subprocess.Popen(
            [sys.executable, '-B', '-u', '-c', BOOTSTRAP, str(SOURCE), temp, str(port)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        try:
            deadline = time.monotonic() + 10
            while True:
                if process.poll() is not None:
                    raise AssertionError('Synthetic receiver did not start')
                try:
                    with socket.create_connection(('127.0.0.1', port), timeout=0.1):
                        break
                except OSError:
                    if time.monotonic() > deadline:
                        raise AssertionError('Synthetic receiver listener timed out')
                    time.sleep(0.05)

            def request(method, target, body=None, headers=None):
                connection = http.client.HTTPConnection('127.0.0.1', port, timeout=5)
                try:
                    connection.request(method, target, body=body, headers=headers or {})
                    response = connection.getresponse()
                    return response.status, dict(response.getheaders()), response.read()
                finally:
                    connection.close()

            status, headers, page = request('GET', '/start', headers={'Sec-Purpose': 'prefetch'})
            check(status == 200 and 'Location' not in headers, 'GET preview must not begin authorization')
            check(headers.get('Cache-Control') == 'no-store', 'Start page must not be cached')
            check(headers.get('Referrer-Policy') == 'same-origin', 'Start form must preserve its local Origin without sharing cross-origin referrers')
            check(headers.get('X-Frame-Options') == 'DENY', 'Start page must deny framing')
            check("frame-ancestors 'none'" in headers.get('Content-Security-Policy', ''), 'Start CSP must deny framing')
            match = re.search(rb'name="start_nonce" value="([A-Za-z0-9_-]{43})"', page)
            check(match is not None, 'Start form must have a private nonce')
            nonce = match.group(1).decode()
            status, _, _ = request('GET', '/start')
            check(status == 200, 'Opening the start page again must be harmless')
            status, _, _ = request('GET', '/start', headers={'Host': 'foreign.invalid'})
            check(status == 400, 'Foreign Host must remain rejected')
            status, _, _ = request('GET', '/start?unexpected=1')
            check(status == 400, 'Start query parameters must be rejected')
            status, _, _ = request('GET', '/callback?code=forged&state=forged&iss=foreign')
            check(status == 400, 'Forged callback before start must remain rejected')
            form_headers = {'Origin': origin, 'Content-Type': 'application/x-www-form-urlencoded'}
            form = urllib.parse.urlencode({'start_nonce': nonce})
            status, _, _ = request('POST', '/start', form, {**form_headers, 'Origin': 'https://foreign.invalid'})
            check(status == 403, 'Cross-origin form must not consume start')
            status, _, _ = request('POST', '/start', form, {'Content-Type': 'application/x-www-form-urlencoded'})
            check(status == 403, 'Missing Origin must not consume start')
            status, _, _ = request('POST', '/start', form, {**form_headers, 'Origin': 'null'})
            check(status == 403, 'Opaque Origin must remain rejected')
            status, _, _ = request('POST', '/start', 'start_nonce=wrong', form_headers)
            check(status == 403, 'Wrong nonce must not consume start')
            status, _, _ = request('POST', '/start', 'start_nonce=%C3%A9', form_headers)
            check(status == 403, 'Non-ASCII nonce must fail closed without crashing')
            status, _, _ = request('POST', '/start', form + '&' + form, form_headers)
            check(status == 400, 'Duplicate nonce must not consume start')
            status, _, _ = request('POST', '/start', form + '&extra=1', form_headers)
            check(status == 400, 'Extra fields must not consume start')
            status, _, _ = request('POST', '/start', 'x' * 513, form_headers)
            check(status == 413, 'Oversized form must not consume start')
            status, _, _ = request('POST', '/start', form, {**form_headers, 'Transfer-Encoding': 'chunked'})
            check(status == 400, 'Ambiguous transfer framing must be rejected')
            status, _, _ = request('POST', '/start?unexpected=1', form, form_headers)
            check(status == 400, 'POST query parameters must be rejected')
            status, _, _ = request('GET', '/start')
            check(status == 200, 'Rejected requests must leave start usable')
            status, headers, _ = request('POST', '/start', form, form_headers)
            check(status == 303, 'Explicit valid user action must begin authorization')
            check(headers.get('Referrer-Policy') == 'no-referrer', 'Issuer redirect must still suppress referrers')
            location = urllib.parse.urlsplit(headers.get('Location', ''))
            query = urllib.parse.parse_qs(location.query)
            check(location.scheme + '://' + location.netloc == credentials['issuer'] and location.path == '/authorize', 'Start must target only the fixed disposable issuer')
            check(query.get('resource') == [credentials['audience']] and query.get('client_id') == [credentials['client_id']], 'Start must retain the fixed resource and client')
            check(query.get('redirect_uri') == [credentials['redirect_uri']] and query.get('code_challenge_method') == ['S256'], 'Start must retain the fixed redirect and PKCE')
            status, _, _ = request('POST', '/start', form, form_headers)
            check(status == 409, 'Start action must remain one-use')
            status, _, _ = request('GET', '/start')
            check(status == 409, 'Repeated start after beginning must explain the conflict')
            check(not (private / 'current-grant-pending.json').exists(), 'Local start checks must never create a grant marker')
            check(not (root / 'workers').exists(), 'Local start checks must never claim a lifecycle result')
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)
    print(f'Local receiver validation: {checks} checks passed; synthetic credentials, loopback only, no cloud requests.')


if __name__ == '__main__':
    main()
