const db = require("../../config/database");

const fetchCourtsWithLocation = async (req, res) => {
  const { location } = req.params;

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }

  const courtIdsData = [];

  const courtsData = [];

  const courtImagesData = [];

  await db.query("BEGIN");

  try {
    const getCourtByLocationQuery = "SELECT * FROM locations WHERE city = $1";
    const getCourtByLocationResult = await db.query(getCourtByLocationQuery, [
      location,
    ]);
    for (court of getCourtByLocationResult.rows) {
      courtIdsData.push(court.court_id);
    }

    const getCourtsDataQuery = "SELECT * FROM courts WHERE id = $1";
    for (courtId of courtIdsData) {
      if (courtId) {
        try {
          const getCourtsDataResult = await db.query(getCourtsDataQuery, [
            courtId,
          ]);
          // Getting court data
          let courtData = getCourtsDataResult.rows[0];

          // Getting location data
          const getLocationQuery =
            "SELECT * FROM locations WHERE court_id = $1";
          const getLocationRes = await db.query(getLocationQuery, [courtId]);
          const locationData = getLocationRes.rows[0] || {};

          // Getting pricing data
          const getPricingQuery =
            "SELECT * FROM venue_price WHERE court_id = $1";
          const getPricingRes = await db.query(getPricingQuery, [courtId]);
          const courtPriceData = getPricingRes.rows[0] || {};

          // Getting images data for the specific court
          const getImagesQuery =
            "SELECT * FROM court_images WHERE court_id = $1";
          const getImagesRes = await db.query(getImagesQuery, [courtId]);

          // Get images specific to this court
          const courtImagesData = getImagesRes.rows[0] || []; // Use all images, or an empty array if none

          // Combine all data into courtData
          courtData = {
            ...courtData,
            locationData,
            courtPriceData,
            courtImagesData, // This will now only contain images for the specific court
          };

          courtsData.push(courtData);
        } catch (error) {
          console.error(error);
        }
      }
    }

    // console.log(courtsData);
    await db.query("COMMIT");
    res.status(200).json({
      message: "Success",
      courtsData,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { fetchCourtsWithLocation };
