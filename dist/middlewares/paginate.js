"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = async (limit = 5, cursor = null, Model) => {
    let collection;
    if (cursor) {
        collection = await Model.find({
            _id: {
                $lt: cursor,
            },
        })
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .exec();
    }
    else {
        collection = await Model.find({})
            .sort({ createdAt: -1 })
            .limit(limit + 1);
    }
    const hasMore = collection.length === limit + 1;
    let nextCursor = null;
    if (hasMore) {
        nextCursor = collection[limit - 1];
        collection.pop();
    }
    return {
        data: collection,
        paging: {
            hasMore,
            nextCursor: hasMore ? nextCursor.id : null,
        },
    };
};
exports.paginate = paginate;
//# sourceMappingURL=paginate.js.map