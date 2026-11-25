# manba.html + rasm/ -> bitta index.html (rasmlar ichida)
import base64, pathlib, re
root = pathlib.Path(__file__).parent
page = (root / 'manba.html').read_text(encoding='utf-8')
def photo(m):
    data = (root / 'rasm' / (m.group(1) + '.jpg')).read_bytes()
    return 'data:image/jpeg;base64,' + base64.b64encode(data).decode()
(root / 'index.html').write_text(re.sub(r'\{\{(\w+)\}\}', photo, page), encoding='utf-8')
