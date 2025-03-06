// Fix timestamp handling in sort function
this.quotes.sort((a, b) => 
    DateTime.fromISO(a.timestamp.toISOString()).toMillis() - 
    DateTime.fromISO(b.timestamp.toISOString()).toMillis()
);

// Fix timestamp conversion in other places
const timestamp = DateTime.fromISO(quote.timestamp.toISOString());

const prevTimestamp = DateTime.fromISO(prev.timestamp.toISOString());
const currTimestamp = DateTime.fromISO(curr.timestamp.toISOString());

// Fix timestamp assignment - convert to Date object
timestamp: new Date(nextTimestamp.toISO()!), // Convert ISO string to Date