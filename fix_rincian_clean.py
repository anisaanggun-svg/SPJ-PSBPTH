import zipfile
import xml.etree.ElementTree as ET
import re

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
ET.register_namespace('w', ns['w'])

with zipfile.ZipFile('public/templates/rincian_biaya_perjalanan_dinas.docx.bak', 'r') as z_in:
    xml_content = z_in.read('word/document.xml')

root = ET.fromstring(xml_content)

# Find the row containing 'FOR item IN items'
target_row = None
for row in root.iter(f"{{{ns['w']}}}tr"):
    text = ''.join(node.text for node in row.iter(f"{{{ns['w']}}}t") if node.text)
    if '+++FOR item IN items+++' in text:
        target_row = row
        break

if target_row is not None:
    # Create FOR row (copy target_row, keep only FOR)
    import copy
    for_row = copy.deepcopy(target_row)
    for t in for_row.iter(f"{{{ns['w']}}}t"):
        if t.text:
            if '+++FOR item IN items+++' in t.text:
                t.text = '+++FOR item IN items+++'
            else:
                t.text = ''

    # Create END-FOR row
    end_row = copy.deepcopy(target_row)
    for t in end_row.iter(f"{{{ns['w']}}}t"):
        if t.text:
            if '+++END-FOR item+++' in t.text:
                t.text = '+++END-FOR item+++'
            else:
                t.text = ''

    # Modify Data row
    for t in target_row.iter(f"{{{ns['w']}}}t"):
        if t.text:
            t.text = t.text.replace('+++FOR item IN items+++', '').replace('+++END-FOR item+++', '')

    # Insert rows
    parent = None
    # Find parent of target_row
    for tbl in root.iter(f"{{{ns['w']}}}tbl"):
        rows = list(tbl)
        if target_row in rows:
            idx = rows.index(target_row)
            tbl.insert(idx, for_row)
            tbl.insert(idx + 2, end_row)
            break

xml_out = ET.tostring(root, encoding='utf-8', xml_declaration=True)

with zipfile.ZipFile('public/templates/rincian_biaya_perjalanan_dinas.docx.bak', 'r') as z_in:
    with zipfile.ZipFile('public/templates/rincian_biaya_perjalanan_dinas.docx', 'w') as z_out:
        for item in z_in.infolist():
            if item.filename == 'word/document.xml':
                z_out.writestr(item, xml_out)
            else:
                z_out.writestr(item, z_in.read(item.filename))

print("Template fixed with ElementTree!")
