import uploadImage from '../services/cloudinaryService.js';
import Product from '../models/product.js';


import mongoose from "mongoose"


export const createAuction = async (req, res) => {
    try {
        const { itemName, startingPrice, itemDescription, itemCategory, itemStartDate, itemEndDate } = req.body;
        let imageUrl = '';

        if (req.file) {
            try {
                imageUrl = await uploadImage(req.file);
            } catch (error) {
                return res.status(500).json({ message: 'Error uploading image to Cloudinary', error: error.message });
            }
        }

        const start = itemStartDate ? new Date(itemStartDate) : new Date();
        const end = new Date(itemEndDate);
        if (end <= start) {
            return res.status(400).json({ message: 'Auction end date must be after start date' });
        }

        const newAuction = new Product({
            itemName,
            startingPrice,
            currentPrice: startingPrice,
            itemDescription,
            itemCategory,
            itemPhoto: imageUrl,
            itemStartDate: start,
            itemEndDate: end,
            seller: req.user.id,
        });
        await newAuction.save();

        res.status(201).json({ message: 'Auction created successfully', newAuction });
    } catch (error) {
        res.status(500).json({ message: 'Error creating auction', error: error.message });
    }
};

export const showAuction = async (req, res) => {
    try {
        const { 
            search_text, 
            page_no = 1, 
            page_size = 100, 
            category_id, 
            min_price, 
            max_price,
            sort_by = 'newest', // Keep for backward compatibility
            sort_date,
            sort_price,
            sort_bids,
            categories,
            my_auction
        } = req.query;

        // Convert to numbers and validate
        const pageNo = Math.max(1, parseInt(page_no) || 1);
        const pageSize = Math.min(1000, Math.max(1, parseInt(page_size) || 100));
        const skip = (pageNo - 1) * pageSize;

        // Build query object
        const query = {
            itemEndDate: { $gt: new Date() }
        };

        // Add my_auction filter - only show auctions where seller is the current user
        if (my_auction === 'true' || my_auction === true) {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    message: 'Authentication required to view your auctions' 
                });
            }
            query.seller = new mongoose.Types.ObjectId(req.user.id);
        }

        // Add search functionality for item name
        if (search_text && search_text.trim()) {
            query.itemName = { 
                $regex: search_text.trim(), 
                $options: 'i'
            };
        }

        // Handle multiple categories filtering (categories are always IDs)
        if (categories && categories.trim()) {
            let categoryArray;
            if (typeof categories === 'string') {
                categoryArray = categories.split(',').map(cat => cat.trim()).filter(cat => cat);
            } else if (Array.isArray(categories)) {
                categoryArray = categories.filter(cat => cat && cat.trim());
            }
            
            if (categoryArray && categoryArray.length > 0) {
                // Filter valid ObjectIds and convert to ObjectId instances
                const validCategoryIds = categoryArray
                    .filter(id => mongoose.Types.ObjectId.isValid(id))
                    .map(id => new mongoose.Types.ObjectId(id));
                
                if (validCategoryIds.length > 0) {
                    query.itemCategory = { $in: validCategoryIds };
                }
            }
        }
        
        // Handle single category_id parameter
        if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
            if (query.itemCategory && query.itemCategory.$in) {
                query.itemCategory.$in.push(new mongoose.Types.ObjectId(category_id));
            } else {
                query.itemCategory = new mongoose.Types.ObjectId(category_id);
            }
        }

        // Add price range filter
        if (min_price || max_price) {
            query.currentPrice = {};
            if (min_price && !isNaN(parseFloat(min_price))) {
                query.currentPrice.$gte = parseFloat(min_price);
            }
            if (max_price && !isNaN(parseFloat(max_price))) {
                query.currentPrice.$lte = parseFloat(max_price);
            }
        }

        // Build sort options from separate parameters
        const buildSortOptionsFromParams = (sortDate, sortPrice, sortBids, fallbackSortBy) => {
            const sortOptions = {};
            
            // Handle date sorting
            if (sortDate) {
                switch (sortDate) {
                    case 'newest':
                        sortOptions.createdAt = -1;
                        break;
                    case 'oldest':
                        sortOptions.createdAt = 1;
                        break;
                }
            }
            
            // Handle price sorting
            if (sortPrice) {
                switch (sortPrice) {
                    case 'priceHigh':
                        sortOptions.currentPrice = -1;
                        break;
                    case 'priceLow':
                        sortOptions.currentPrice = 1;
                        break;
                }
            }
            
            // Handle bids sorting
            if (sortBids) {
                switch (sortBids) {
                    case 'bidCountHigh':
                        sortOptions.bidsCount = -1;
                        break;
                    case 'bidCountLow':
                        sortOptions.bidsCount = 1;
                        break;
                }
            }
            
            // If no separate sort parameters are provided, fall back to the old sort_by parameter
            if (Object.keys(sortOptions).length === 0 && fallbackSortBy) {
                const parseSortBy = (sortByParam) => {
                    if (!sortByParam) return ['newest'];
                    
                    if (typeof sortByParam === 'string') {
                        return sortByParam.split(',').map(s => s.trim()).filter(s => s);
                    }
                    return Array.isArray(sortByParam) ? sortByParam : ['newest'];
                };

                const sortArray = parseSortBy(fallbackSortBy);
                
                sortArray.forEach(sort => {
                    switch (sort) {
                        case 'newest':
                            sortOptions.createdAt = -1;
                            break;
                        case 'oldest':
                            sortOptions.createdAt = 1;
                            break;
                        case 'priceHigh':
                            sortOptions.currentPrice = -1;
                            break;
                        case 'priceLow':
                            sortOptions.currentPrice = 1;
                            break;
                        case 'bidCountHigh':
                            sortOptions.bidsCount = -1;
                            break;
                        case 'bidCountLow':
                            sortOptions.bidsCount = 1;
                            break;
                    }
                });
            }
            
            // Default to newest if no sorting is specified
            if (Object.keys(sortOptions).length === 0) {
                sortOptions.createdAt = -1;
            }
            
            return sortOptions;
        };

        const sortOptions = buildSortOptionsFromParams(sort_date, sort_price, sort_bids, sort_by);
        
        // Check if we need aggregation (for bid count sorting)
        const needsAggregation = sort_bids && (sort_bids === 'bidCountHigh' || sort_bids === 'bidCountLow');

        let auctions;
        let totalCount;

        if (needsAggregation) {
            // Get total count using aggregation
            const countPipeline = [
                { $match: query },
                { $count: "total" }
            ];
            const countResult = await Product.aggregate(countPipeline);
            totalCount = countResult.length > 0 ? countResult[0].total : 0;

            // Aggregation pipeline with proper population
            const pipeline = [
                { $match: query },
                {
                    $addFields: {
                        bidsCount: { $size: "$bids" }
                    }
                },
                {
                    $lookup: {
                        from: "users", // Make sure this matches your User collection name
                        localField: "seller",
                        foreignField: "_id",
                        as: "sellerInfo"
                    }
                },
                {
                    $lookup: {
                        from: "categories", // Make sure this matches your Category collection name
                        localField: "itemCategory",
                        foreignField: "_id",
                        as: "categoryInfo"
                    }
                },
                {
                    $addFields: {
                        seller: {
                            $cond: {
                                if: { $gt: [{ $size: "$sellerInfo" }, 0] },
                                then: { 
                                    _id: { $arrayElemAt: ["$sellerInfo._id", 0] },
                                    name: { $arrayElemAt: ["$sellerInfo.name", 0] }
                                },
                                else: { _id: null, name: null }
                            }
                        },
                        itemCategory: {
                            $cond: {
                                if: { $gt: [{ $size: "$categoryInfo" }, 0] },
                                then: {
                                    _id: { $arrayElemAt: ["$categoryInfo._id", 0] },
                                    name: { $arrayElemAt: ["$categoryInfo.name", 0] }
                                },
                                else: { _id: null, name: null }
                            }
                        }
                    }
                },
                {
                    $project: {
                        sellerInfo: 0,
                        categoryInfo: 0
                    }
                },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: pageSize },
                {
                    $project: {
                        itemName: 1,
                        itemDescription: 1,
                        currentPrice: 1,
                        bids: 1,
                        itemEndDate: 1,
                        itemCategory: 1,
                        itemPhoto: 1,
                        seller: 1,
                        bidsCount: 1,
                        createdAt: 1
                    }
                }
            ];

            auctions = await Product.aggregate(pipeline);
        } else {
            // Use regular query with populate
            totalCount = await Product.countDocuments(query);
            
            auctions = await Product.find(query)
                .populate("seller", "name _id")
                .populate("itemCategory", "name _id")
                .select("itemName itemDescription currentPrice bids itemEndDate itemCategory itemPhoto seller createdAt")
                .sort(sortOptions)
                .skip(skip)
                .limit(pageSize)
                .lean(); // Add lean() for better performance
        }

        const totalPages = Math.ceil(totalCount / pageSize);

        // Format the response
        const formatted = auctions.map(auction => ({
            _id: auction._id,
            itemName: auction.itemName,
            itemDescription: auction.itemDescription,
            currentPrice: auction.currentPrice,
            bidsCount: auction.bidsCount || auction.bids?.length || 0,
            timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
            itemCategory: {
                _id: auction.itemCategory?._id || null,
                name: auction.itemCategory?.name || null
            },
            seller: {
                _id: auction.seller?._id || null,
                name: auction.seller?.name || null
            },
            itemPhoto: auction.itemPhoto || "",
        }));

        // Response with pagination info
        res.status(200).json({
            data: formatted,
            pagination: {
                currentPage: pageNo,
                pageSize: pageSize,
                totalItems: totalCount,
                totalPages: totalPages,
                hasNextPage: pageNo < totalPages,
                hasPrevPage: pageNo > 1,
                nextPage: pageNo < totalPages ? pageNo + 1 : null,
                prevPage: pageNo > 1 ? pageNo - 1 : null
            },
            filters: {
                search_text: search_text || null,
                category_id: category_id || null,
                categories: categories || null,
                min_price: min_price || null,
                max_price: max_price || null,
                sort_by: sort_by || 'newest', // Keep for backward compatibility
                sort_date: sort_date || null,
                sort_price: sort_price || null,
                sort_bids: sort_bids || null,
                my_auction: my_auction || null
            }
        });

    } catch (error) {
        console.error('Error fetching auctions:', error);
        return res.status(500).json({ 
            message: 'Error fetching auctions', 
            error: error.message 
        });
    }
};
export const auctionById = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await Product.findById(id)
            .populate("seller", "name")
            .populate("bids.bidder", "name")
            .populate("itemCategory","_id name")
        auction.bids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
        res.status(200).json(auction);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching auctions', error: error.message });
    }
}

export const placeBid = async (req, res) => {
    try {
        const { bidAmount } = req.body;
        const user = req.user.id;
        const { id } = req.params;

        const product = await Product.findById(id).populate('bids.bidder', "name");
        if (!product) return res.status(404).json({ message: "Auction not found" });

        if (new Date(product.itemEndDate) < new Date()) 
            return res.status(400).json({ message: "Auction has already ended" });

        // Check if user is not the seller
        if (product.seller.toString() === user) {
            return res.status(400).json({ message: "Sellers cannot bid on their own items" });
        }

        const minBid = Math.max(product.currentPrice, product.startingPrice) + 1;
        const maxBid = Math.max(product.currentPrice, product.startingPrice) + 10;
        if (bidAmount < minBid) 
            return res.status(400).json({ message: `Bid must be at least Rs ${minBid}` });
        if (bidAmount > maxBid) 
            return res.status(400).json({ message: `Bid must be at max Rs ${maxBid}` });

        // Create new bid object (bidTime will be set automatically by schema default)
        const newBid = {
            bidder: user,
            bidAmount: bidAmount
        };

        // Add new bid to the beginning of array (most recent first)
        product.bids.unshift(newBid);
        product.currentPrice = bidAmount;
        
        await product.save();

        // Re-populate the product to get the updated bid with bidder details
        const updatedProduct = await Product.findById(id).populate('bids.bidder', 'name');
        const populatedBid = updatedProduct.bids[0]; // Get the newly added bid

        // Get Socket.IO instance and emit real-time update
        const io = req.app.get('io');
        if (io) {
            // Emit to all users in this auction room
            io.to(`auction_${id}`).emit('newBid', {
                bidAmount: populatedBid.bidAmount,
                bidder: {
                    _id: populatedBid.bidder._id,
                    name: populatedBid.bidder.name
                },
                bidTime: populatedBid.bidTime
            });

            // Optional: Emit updated auction stats
            io.to(`auction_${id}`).emit('auctionUpdate', {
                auctionId: id,
                currentPrice: product.currentPrice,
                totalBids: product.bids.length,
                minNextBid: product.currentPrice + 1,
                maxNextBid: product.currentPrice + 10
            });
        }

        res.status(200).json({ 
            message: "Bid placed successfully",
            bidAmount: bidAmount,
            currentPrice: product.currentPrice,
            totalBids: product.bids.length,
            minNextBid: product.currentPrice + 1,
            maxNextBid: product.currentPrice + 10
        });

    } catch (error) {
        console.error('Error placing bid:', error);
        res.status(500).json({ message: "Error placing bid", error: error.message });
    }
}

export const dashboardData = async (req, res) => {
    try {
        const dateNow = new Date();
        const isAuthenticated = req.user ? true : false;
        
        // Get global stats that everyone can see
        const globalStats = await Product.aggregate([
            {
                $facet: {
                    totalAuctions: [{ $count: "count" }],
                    activeAuctions: [
                        { $match: { itemStartDate: { $lte: dateNow }, itemEndDate: { $gte: dateNow } } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const totalAuctions = globalStats[0].totalAuctions[0]?.count || 0;
        const activeAuctions = globalStats[0].activeAuctions[0]?.count || 0;
        
        // Get latest global auctions (visible to everyone)
        const globalAuction = await Product.find({ itemEndDate: { $gt: dateNow } })
            .populate("seller", "_id name")
            .populate("itemCategory","_id name")
            .sort({ createdAt: -1 })
            .limit(8);
            
        const latestAuctions = globalAuction.map(auction => ({
            _id: auction._id,
            itemName: auction.itemName,
            itemDescription: auction.itemDescription,
            currentPrice: auction.currentPrice,
            bidsCount: auction.bids.length,
            timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
            itemCategory: auction.itemCategory,
            seller: auction.seller,
            itemPhoto: auction.itemPhoto,
        }));

        // If user is authenticated, get their personal data
        let userAuctionCount = 0;
        let latestUserAuctions = [];
        
        if (isAuthenticated) {
            const userObjectId = new mongoose.Types.ObjectId(req.user.id);
            
            // Get user's auction count
            const userStats = await Product.aggregate([
                {
                    $facet: {
                        userAuctionCount: [
                            { $match: { seller: userObjectId } }, 
                            { $count: "count" }
                        ]
                    }
                }
            ]);
            
            userAuctionCount = userStats[0].userAuctionCount[0]?.count || 0;
            
            // Get user's latest auctions
            const userAuction = await Product.find({ seller: userObjectId })
                .populate("seller", "_id name")
                .populate("itemCategory","_id name")
                .sort({ createdAt: -1 })
                .limit(8);
                
            latestUserAuctions = userAuction.map(auction => ({
                _id: auction._id,
                itemName: auction.itemName,
                itemDescription: auction.itemDescription,
                currentPrice: auction.currentPrice,
                bidsCount: auction.bids.length,
                timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
                itemCategory: auction.itemCategory,
                seller: auction.seller,
                itemPhoto: auction.itemPhoto,
            }));
        }

        const responseData = {
            totalAuctions,
            activeAuctions,
            latestAuctions,
            isAuthenticated,
        };

        // Add user-specific data only if authenticated
        if (isAuthenticated) {
            responseData.userAuctionCount = userAuctionCount;
            responseData.latestUserAuctions = latestUserAuctions;
        } else {
            responseData.message = "Login to view your personal auction statistics";
        }

        return res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({ 
            message: "Error getting dashboard data", 
            error: error.message 
        });
    }
}
