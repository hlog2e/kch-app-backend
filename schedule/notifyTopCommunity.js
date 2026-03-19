const Communities = require("../models/community");
const { sendNotificationByCategory } = require("../utils/expo-notifications");

module.exports = async () => {
  try {
    const now = new Date();

    const [topPost] = await Communities.aggregate([
      { $match: { status: "normal" } },
      {
        $addFields: {
          popularityScore: {
            $divide: [
              {
                $add: [
                  { $ifNull: ["$likeCount", 0] },
                  { $ifNull: ["$commentCount", 0] },
                  { $size: { $ifNull: ["$views", []] } },
                ],
              },
              {
                $add: [
                  1,
                  {
                    $multiply: [
                      {
                        $max: [
                          0,
                          {
                            $subtract: [
                              {
                                $divide: [
                                  { $subtract: [now, "$createdAt"] },
                                  86400000,
                                ],
                              },
                              30,
                            ],
                          },
                        ],
                      },
                      0.1,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      { $sort: { popularityScore: -1, createdAt: -1 } },
      { $limit: 1 },
    ]);

    if (!topPost) return;

    const preview =
      topPost.content?.length > 30
        ? topPost.content.slice(0, 30) + "..."
        : topPost.content || "";
    const body = `${preview}오늘의 인기 게시글을 확인해보세요`;

    await sendNotificationByCategory(
      "community_top",
      topPost.title,
      body,
      `kch://community/detail?id=${topPost._id}`,
      []
    );
  } catch (error) {
    console.error("notifyTopCommunity error:", error);
  }
};
