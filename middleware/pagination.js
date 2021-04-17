module.exports.paginatedResult = (model, sortFlag = true) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    let sortOptions = {};
    // http://localhost:5000/user/users?sort=username:desc
    if (req.query.sort) {
      const str = req.query.sort.split(":");
      sortOptions[str[0]] = str[1] === "desc" ? -1 : 1;
    } else {
      sortOptions = { createdAt: 1 };
    }

    // let filterOptions = {};
    // if (req.query.filter) {
    //   const str = req.query.filter.split(":");
    //   console.log(str);
    //   filterOptions[str[0]] = { $eq: str[1], $exists: true };
    //   console.log(filterOptions);
    // }

    const filterOptions = {};
    if (req.query.filter) {
      const str = req.query.filter.split(":");
      // filterOptions[str[0]] = { $regex: str[1], $options: "$i" };
    }
    const searchOptions = {};
    if (req.query.search) {
      const str = req.query.search.split(":");
      searchOptions[str[0]] = { $regex: str[1], $options: "$i" };
    }

    const startIndex = (page - 1) * limit;
    console.log(searchOptions);
    try {
      let results;
      if (sortFlag) {
        results = await model
          .find(searchOptions)
          .limit(limit)
          .skip(startIndex)
          .sort(sortOptions)
          .exec();
      } else {
        results = await model.find().limit(limit).skip(startIndex).exec();
      }
      // get total documents in the collection
      const count = await model.countDocuments();
      res.json({
        results,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  };
};
