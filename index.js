const { client } = require('./module');
require('./cmd')(client);
require('./sharecmd')(client);
require('./server')(client);

client.login('MTI2Njc3Mzk5ODE3MjExMDkxOQ.GRFcY3.jnvt6zxKOgWq7fnBTqtO3SGmtCCXbodejm9XMA'); // Ganti dengan token bot Anda yang benar
