const { client } = require('./module');
require('./cmd')(client);
require('./sharecmd')(client);
require('./server')(client);

//client.login(); // Ganti dengan token bot Anda yang benar
