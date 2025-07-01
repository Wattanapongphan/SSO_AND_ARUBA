const axios = require("axios");
const qs = require("qs");

exports.authOne = (req, res) => {
  try {
    const url = `${process.env.ONE_ENVIRONMENT}/api/oauth/getcode?client_id=${process.env.ONE_CLIENT_ID}&response_type=code&scope=&redirect_uri=`;
    res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Failed to create URL" });
  }
};

exports.accessToken = async (req, res) => {
  try {
    const { code } = req.query;

    const payload = {
      grant_type: "authorization_code",
      client_id: process.env.ONE_CLIENT_ID,
      client_secret: process.env.ONE_CLIENT_SECRET,
      code: code,
    };

    const url = `${process.env.ONE_ENVIRONMENT}/oauth/token`;
    const response = await axios.post(url, qs.stringify(payload), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ success: false, message: "Failed to get AccessToken" });
  }
};
