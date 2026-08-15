import re

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'r') as f:
    content = f.read()

# Replace handleContentItemClick
old_handle_content = """                  markContentItemSeen(user.id, item.id);
                  if (entry.mcqOnly) {
                    lucentInitialTabRef.current = { tab: 'MCQS' };
                    tryOpenLucentNote(entry, 0);
                  } else {
                    setLucentPageListViewer(_withSortedPages(entry));
                    tryOpenLucentNote(entry, item.pageIndex);
                  }
                  setShowInbox(false);"""

new_handle_content = """                  markContentItemSeen(user.id, item.id);
                  if (entry.mcqOnly) {
                    lucentInitialTabRef.current = { tab: 'MCQS' };
                    tryOpenLucentNote(entry, 0);
                  } else {
                    setLucentPageListViewer(_withSortedPages(entry));
                  }
                  setShowInbox(false);"""

content = content.replace(old_handle_content, new_handle_content)

# Replace openItem
old_open_item = """          markContentItemSeen(user.id, item.id);
          setLucentNoteViewer(_withSortedPages(entry));
          setLucentPageListViewer(_withSortedPages(entry));
          setLucentPageIndex(item.pageIndex);
          setShowContentNewSheet(false);"""

new_open_item = """          markContentItemSeen(user.id, item.id);
          if (entry.mcqOnly) {
            lucentInitialTabRef.current = { tab: 'MCQS' };
            tryOpenLucentNote(entry, 0);
          } else {
            setLucentPageListViewer(_withSortedPages(entry));
          }
          setShowContentNewSheet(false);"""

content = content.replace(old_open_item, new_open_item)

with open('artifacts/iic-study-app/src/components/StudentDashboard.tsx', 'w') as f:
    f.write(content)
