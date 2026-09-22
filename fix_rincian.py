import zipfile
import re
import os

with zipfile.ZipFile('public/templates/rincian_biaya_perjalanan_dinas.docx.bak', 'r') as z_in:
    with zipfile.ZipFile('public/templates/rincian_biaya_perjalanan_dinas.docx', 'w') as z_out:
        for item in z_in.infolist():
            content = z_in.read(item.filename)
            if item.filename == 'word/document.xml':
                xml = content.decode('utf-8')
                
                def replacer(match):
                    row_xml = match.group(0)
                    if '+++FOR item IN items+++' in row_xml and '+++END-FOR item+++' in row_xml:
                        # Create FOR row (we must preserve the <w:tc> structure but empty text)
                        def for_replacer(m):
                            t = m.group(1)
                            if '+++FOR item IN items+++' in t: return m.group(0)
                            return '<w:t></w:t>'
                        for_row = re.sub(r'<w:t[^>]*>(.*?)</w:t>', for_replacer, row_xml)
                        
                        # Create data row
                        def data_replacer(m):
                            t = m.group(1)
                            t = t.replace('+++FOR item IN items+++', '').replace('+++END-FOR item+++', '')
                            return m.group(0).replace(m.group(1), t)
                        data_row = re.sub(r'<w:t[^>]*>(.*?)</w:t>', data_replacer, row_xml)
                        
                        # Create END-FOR row
                        def end_for_replacer(m):
                            t = m.group(1)
                            if '+++END-FOR item+++' in t: return m.group(0)
                            return '<w:t></w:t>'
                        end_for_row = re.sub(r'<w:t[^>]*>(.*?)</w:t>', end_for_replacer, row_xml)
                        
                        return for_row + data_row + end_for_row
                    return row_xml
                
                new_xml = re.sub(r'<w:tr[\s>][\s\S]*?</w:tr>', replacer, xml)
                z_out.writestr(item, new_xml.encode('utf-8'))
            else:
                z_out.writestr(item, content)

print("Template rebuilt properly!")
