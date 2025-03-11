import { FeedNoteObject } from "../types/types"

export enum FeedActions { ADD_NOTES, TOGGLE_SAVE_NOTE, TOGGLE_UPVOTE_NOTE } 
export default function feedReducer(feedNotes: FeedNoteObject[], actions: { type: FeedActions, payload?: any }) {
    switch(actions.type) {
        case FeedActions.ADD_NOTES:
            return [...feedNotes, ...actions.payload.notes.map((note: any) => new FeedNoteObject(note))]
        case FeedActions.TOGGLE_SAVE_NOTE:
            return feedNotes.map(note => {
                if (note.noteData.noteID === actions.payload.noteID) {
                    return { ...note, interactionData: { ...note.interactionData, isSaved: !note.interactionData.isSaved } }
                }
                return note
            })
        case FeedActions.TOGGLE_UPVOTE_NOTE:
            return feedNotes.map(note => {
                if (note.noteData.noteID === actions.payload.noteID) {
                    return { ...note, interactionData: { ...note.interactionData, isUpvoted: !note.interactionData.isUpvoted, upvoteCount: note.interactionData.upvoteCount + (note.interactionData.isUpvoted ? -1 : +1) } }
                }
                return note
            })
        default:
            return feedNotes
    }
}
