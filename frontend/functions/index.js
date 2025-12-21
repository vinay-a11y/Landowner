const functions = require("firebase-functions")
const axios = require("axios")

exports.api = functions.https.onRequest(async (req, res) => {
  try {
    const backend = "http://139.59.2.94:5000"

    const response = await axios({
      method: req.method,
      url: backend + req.originalUrl,
      headers: {
        ...req.headers,
        host: undefined
      },
      data: req.body
    })

    res.status(response.status).send(response.data)
  } catch (err) {
    res.status(500).json({
      error: "Proxy error",
      message: err.message
    })
  }
})
