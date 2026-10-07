const ANILIST_URL = "https://graphql.anilist.co";

export async function searchManga(search) {
  const query = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          hasNextPage
        }

        media(search: $search, type: MANGA) {
          id

          title {
            romaji
            english
            native
          }

          coverImage {
            large
          }

          chapters
          volumes
        }
      }
    }
  `;

  const variables = {
    search,
    page: 1,
    perPage: 10,
  };

  const response = await fetch(ANILIST_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("AniList request failed");
  }

  return data.data.Page;
}
