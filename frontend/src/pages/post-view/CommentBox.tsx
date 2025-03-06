import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";

const initialConfig = {
  namespace: "CommentBox",
  nodes: [ListNode, ListItemNode],
  onError: (error: Error) => {},
};

function CommentBox() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          ErrorBoundary={({ children }) => <>{children}</>}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin
          onChange={(editorState) => {}}
        />
        <ListPlugin />
      </div>
      <button>Send</button>
    </LexicalComposer>
  );
}

export default CommentBox;
