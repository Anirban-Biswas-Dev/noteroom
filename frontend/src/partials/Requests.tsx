import { useEffect, useState } from "react"

class RequestObject {
    recID: string;
    senderDisplayName: string;
    createdAt: string;
    message: string;

    constructor(request: any) {
        this.recID = request._id
        this.senderDisplayName = request.senderDocID.displayname
        this.createdAt = request.createdAt
        this.message = request.message
    }
}

function Request({ request }: { request: RequestObject }) {
    const [isReqExpanded, setIsReqExpanded] = useState(false)

    return (
        <div className="request" id={"request-" + request.recID}>
            <div className="request__fr">
                <span className="open-request-card" onClick={() => setIsReqExpanded(!isReqExpanded)}>
                    <svg width="15" className="request-chevron-icon" viewBox="0 0 60 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4.5L30 29.5L55 4.5" stroke="#1E1E1E" strokeWidth="8.33333" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
                <span className="request__fr--requester-name">{request.senderDisplayName}'s Request</span>
                <span className="request__fr--requested-date">{(new Date(request.createdAt)).toLocaleDateString()}</span>
            </div>
            <div className={"request__sr " + (isReqExpanded ? "request__sr--expanded" : "")}>
                <p className="request__sr--request-desc">{request.message}</p>
                <div className="request__sr--request-action-update">
                <button className="btn-request btn-accept-request">
                    Accept
                    <svg className="req-accept-icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 30 30">
                        <path d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z"></path>
                    </svg>
                </button>
                <button className="btn-request btn-reject-request">
                    Reject
                    <svg className="req-reject-icon" width="12" height="12" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3L67 67" stroke="black" strokeWidth="6" strokeLinejoin="round"/>
                        <path d="M67 3L3 67" stroke="black" strokeWidth="6" strokeLinejoin="round"/>
                    </svg>
                </button>
                </div>
            </div>
    </div>
    )
}

export default function RequestsContainer() {
    const [requests, setRequests] = useState([])

    useEffect(() => {
        async function getRequests() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/request/get')
                let requests = await response.json()
                if (requests.objects && requests.objects.length !== 0) {
                    setRequests(requests.objects.map((request: any) => new RequestObject(request)))
                } else {
                    console.log(`No requests`)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getRequests()
    }, [])

    return (
        <div className="right-panel__requests-component">
            <div className="requests-component__header">
                <h4 className="requests-component__header-label">Requests</h4>
            </div>
            <div className="requests-container">
                {requests.map((request: any) => {
                    return <Request request={request} key={request.recID}></Request>
                })}
            </div>
        </div>
    )
}