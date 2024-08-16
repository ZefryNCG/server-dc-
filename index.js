const { client } = require('./module');
require('./cmd')(client);
require('./sharecmd')(client);
require('./server')(client);

const token = process.env.TOKEN;

client.login(token);
