const express = require('express');
const cors = require('cors');

const app = express();

app.options(
    /.*/,
    cors({
        origin: '*',
        optionsSuccessStatus: 200,
    }),
)
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`)
})

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' })
})

module.exports = app