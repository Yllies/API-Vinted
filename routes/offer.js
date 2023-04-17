const express = require("express");
const router = express.Router();

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const Offer = require("../models/Offer");

const isAuthenticated = require("../middleware/isAuthenticated");
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  // isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        condition,
        city,
        brand,
        size,
        color,
        picture,
      } = req.body;
      const token = req.headers.authorization.replace("Bearer ", "");

      const newOffer = await new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,
      });

      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );
      newOffer.product_image = result;
      await newOffer.save();

      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax } = req.query;
    const filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = {
        $gte: priceMin,
      };
    }
    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = {
          $lte: priceMax,
        };
      }
    }
    const sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    }

    let limit = 5;
    let page = 1;

    if (req.query.page) {
      page = req.query.page;
    }

    const skip = (page - 1) * limit;

    const results = await Offer.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const count = await Offer.countDocuments(filters);

    res.json({ count: count, offers: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
