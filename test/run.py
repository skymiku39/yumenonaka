"""一次跑完 test/scripts.js 裡的操作測試腳本。

用法（在任何資料夾都可以執行）：
    python test/run.py              跑一季與第一年的腳本（不含很長的三年腳本）
    python test/run.py --all        連三年的腳本一起跑
    python test/run.py full mix     只跑指定的腳本
    python test/run.py --show 8     每支腳本多印幾行輸出（預設 3 行）
    python test/run.py --extra q1   多帶網址參數給遊戲，用來比較還沒決定的選項（q1、q6、tight、pace）

需要 Chrome 或 Edge（用無頭模式開 test/harness.html）。找不到時，用環境變數 CHROME 指定執行檔路徑。
只用 Python 標準函式庫，不需要安裝任何套件。
"""
import argparse
import functools
import html
import http.server
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import urllib.parse

# Windows 的主控台預設是 cp950，印到「・」之類的字會當掉，所以自己改成 UTF-8
for _stream in (sys.stdout, sys.stderr):
    _stream.reconfigure(encoding='utf-8', errors='replace')

GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_JS = os.path.join(GAME, 'test', 'scripts.js')

# 存檔測試要多帶參數，否則測試模式不讀寫存檔；第 7 節選項的檢查要帶對應的開關
EXTRA = {'save': 'forcesave', 'save2': 'forcesave', 'weigh': 'q1', 'tightend': 'tight', 'q6dig': 'q6'}
# 失敗的特徵：腳本找不到按鈕、卡住、遊戲出錯
FAIL = re.compile(r'ERR|MISSING|STUCK|MAX STEPS|沒有這個腳本')


def find_browser():
    if os.environ.get('CHROME'):
        return os.environ['CHROME']
    local = os.environ.get('LOCALAPPDATA', '')
    candidates = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        os.path.join(local, r'Google\Chrome\Application\chrome.exe'),
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    for name in ('google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'msedge'):
        found = shutil.which(name)
        if found:
            return found
    return None


def all_scripts():
    with open(SCRIPTS_JS, encoding='utf-8') as f:
        return re.findall(r'^SCRIPTS\.(\w+) =', f.read(), re.M)


def serve():
    handler = functools.partial(QuietHandler, directory=GAME)
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def end_headers(self):
        # 每次都拿最新的檔案，不要用快取
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def run_one(browser, port, name, extra=''):
    # 三年的腳本步數很多，給比較長的虛擬時間
    budget = 900000 if name.startswith('z') else 300000 if name.startswith('y') else 150000
    url = f'http://127.0.0.1:{port}/test/harness.html?s={name}'
    more = '&'.join(x for x in (EXTRA.get(name, ''), extra) if x)
    if more:
        url += '&extra=' + urllib.parse.quote(more)
    with tempfile.TemporaryDirectory() as profile:
        cmd = [browser, '--headless=new', '--disable-gpu', '--no-first-run', f'--user-data-dir={profile}',
               f'--virtual-time-budget={budget}', '--dump-dom', url]
        try:
            out = subprocess.run(cmd, capture_output=True, timeout=600).stdout.decode('utf-8', 'replace')
        except subprocess.TimeoutExpired:
            return 'TIMEOUT'
    m = re.search(r'<pre id="o"[^>]*>(.*?)</pre>', out, re.S)
    return html.unescape(m.group(1)) if m else 'NO OUTPUT'


def main():
    ap = argparse.ArgumentParser(description='跑《中之夢》試玩原型的操作測試')
    ap.add_argument('names', nargs='*', help='腳本名稱；不給就跑全部')
    ap.add_argument('--all', action='store_true', help='連三年（z 開頭）的腳本一起跑')
    ap.add_argument('--show', type=int, default=3, help='每支腳本印出最後幾行')
    ap.add_argument('--extra', default='', help='多帶給遊戲的網址參數，例如 q1 或 q1&tight')
    ap.add_argument('--wide', action='store_true', help='輸出的每一行印完整，不截到 200 字')
    args = ap.parse_args()

    known = all_scripts()
    names = args.names or [n for n in known if args.all or not n.startswith('z')]
    unknown = [n for n in names if n not in known]
    if unknown:
        print('沒有這些腳本：' + '、'.join(unknown))
        print('可用的：' + '、'.join(known))
        return 2

    browser = find_browser()
    if not browser:
        print('找不到 Chrome 或 Edge。請用環境變數 CHROME 指定瀏覽器執行檔的路徑。')
        return 2

    httpd = serve()
    port = httpd.server_address[1]
    failed = []
    try:
        for i, name in enumerate(names, 1):
            text = run_one(browser, port, name, args.extra)
            lines = [l for l in text.splitlines() if l.strip()]
            bad = text in ('NO OUTPUT', 'TIMEOUT') or any(FAIL.search(l) for l in lines)
            print(f'[{i}/{len(names)}] {"失敗" if bad else "通過"}　{name}')
            for l in (lines[-args.show:] if args.show > 0 else []):
                print('    ' + (l if args.wide else l[:200]))
            if bad:
                failed.append(name)
    finally:
        httpd.shutdown()

    print()
    if failed:
        print(f'{len(failed)} 支失敗：' + '、'.join(failed))
        return 1
    print(f'全部 {len(names)} 支通過。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
