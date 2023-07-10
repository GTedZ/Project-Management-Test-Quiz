const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = 80;
app.listen(PORT, () => console.log('Server up and running on port', PORT));
app.get(
    '/'
    ,
    (req, res) => {
        return res.status(200).send(fs.readFileSync('build/index.html').toString());
    }
);