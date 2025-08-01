// Test for parsing titles in M3U files containing commas

// Simulate the title extraction part
function extractTitleOld(line) {
	// Old method with regex
	const titleMatch = line.match(/#EXTINF:.*,(.+)/);
	if (titleMatch?.[1]) {
		return titleMatch[1].trim();
	}
	return null;
}

function extractTitleNew(line) {
	// New method with split
	const parts = line.split(",");
	if (parts.length >= 2) {
		return parts.slice(1).join(",").trim();
	}
	return null;
}

// Test cases
const testCases = [
	"#EXTINF:-1,Simple Title",
	"#EXTINF:-1,CHOI 98,1 - Québec",
	"#EXTINF:-1,Station with multiple, commas, in title",
	"#EXTINF:120,Title with duration",
];

console.log("Testing M3U title parsing with commas:\n");

for (const test of testCases) {
	console.log(`Input: "${test}"`);
	console.log(`Old method: "${extractTitleOld(test)}"`);
	console.log(`New method: "${extractTitleNew(test)}"`);
	console.log("-----------------------");
}
