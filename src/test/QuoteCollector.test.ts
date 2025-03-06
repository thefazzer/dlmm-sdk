// Fix timestamp assignments in test cases - convert to Date objects
timestamp: new Date(DateTime.now().minus({ minutes: 5 }).toISO()!),

timestamp: new Date(DateTime.now().toISO()!),

timestamp: new Date(DateTime.now().minus({ minutes: 5 }).toISO()!),

timestamp: new Date(DateTime.now().toISO()!),