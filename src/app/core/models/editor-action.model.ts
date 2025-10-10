export type EditorActionType =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'codeBlock'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'unorderedList'
  | 'orderedList'
  | 'taskList'
  | 'link'
  | 'image'
  | 'table'
  | 'blockquote'
  | 'horizontalRule'
  | 'math';

export interface EditorAction {
  type: EditorActionType;
  payload?: any;
}
