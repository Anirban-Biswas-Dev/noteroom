/*
=> Notes: This file will contain the interfaces and types for the data-objects that are used for general note services. Like 
~         the data structures sent via sockets or fetch requests.
=> Naming Convention:
~       Interface: I<management>
*/



/**
* @description - For managing notes of a perticular student or a solo note. This is the standard structure
* @param {string} studentDocID - The *documentID* of the owner of the note
* @param {string} noteDocID - The *documentID* of the note  
*/
export interface IManageUserNote {
    studentDocID?: string, 
    noteDocID: string 
}


/**
 * @description - For getting note details of a specific note, this is the standard structure 
* @param {Object} note - Basically this will contain an object of the note's details fetched from the db
* @param {Object} owner - This will contain the owner's metadata for showing it in noteview
* @param {Object} feedbacks - This will contain the list of objects that will contain each feedbacks' metadata
*/
export interface INoteDetails {
    note: any,
    owner: any,
    feedbacks: any
}