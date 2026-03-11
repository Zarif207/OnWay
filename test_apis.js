
async function testHistory() {
    const roomId = "support_67ce96472404e9079367f08b"; // Example from logs if possible, but let's try to find one
    const userId = "support_agent_id"; // dummy
    const role = "support";
    const url = `http://localhost:4001/api/chat/history/${roomId}?userId=${userId}&role=${role}`;
    
    console.log(`Checking URL: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(`Data length: ${data.length}`);
        console.log(`Data sample:`, data[0]);
    } catch (err) {
        console.error("Error:", err);
    }
}

// First let's find a valid support roomId
async function findSupportRoom() {
    try {
        const res = await fetch("http://localhost:4001/api/support/sessions");
        const data = await res.json();
        console.log("Sessions:", data);
        if (data.length > 0) {
            console.log("Testing with first session...");
            const session = data[0];
            const roomId = session.roomId;
            const url = `http://localhost:4001/api/chat/history/${roomId}?userId=test&role=support`;
            const res2 = await fetch(url);
            console.log(`History for ${roomId} status: ${res2.status}`);
            const history = await res2.json();
            console.log(`History length: ${history.length}`);
        }
    } catch (err) {
        console.error("Session fetch failed:", err);
    }
}

findSupportRoom();
