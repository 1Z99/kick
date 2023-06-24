function downloadClip() {
  var clipLink = document.getElementById("clip-link").value;
  var clipID = extractClipID(clipLink);
  var apiURL = "https://kick.com/api/v2/clips/" + clipID;

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      console.log(data); // Log the API response to the console

      var clip = data.clip;
      if (clip && clip.video_url) {
        var videoURL = clip.video_url.replace(/\\\//g, "/");
        var downloadLink = document.createElement("a");
        downloadLink.href = videoURL;
        downloadLink.download = "clip.mp4";
        downloadLink.target = "_blank";
        downloadLink.click();
      } else {
        console.log("Invalid response or video URL not found.");
      }
    })
    .catch(error => {
      console.log("Error retrieving video URL:", error);
    });
}

function extractClipID(clipLink) {
  var regex = /clip=(\d+)$/;
  var matches = regex.exec(clipLink);
  return matches ? matches[1] : null;
}

document.getElementById("download-button").addEventListener("click", downloadClip);

function calculateRank(accountDetails) {
  let rank = 0;

  // Account ID points
  const accountId = parseInt(accountDetails['Account_id']);
  if (accountId >= 1 && accountId <= 16000) {
    rank += 10; // 1 to 16000: 10 points
  } else if (accountId >= 16001 && accountId <= 25000) {
    rank += 7; // 16001 to 25000: 7 points
  } else if (accountId >= 25001 && accountId <= 100000) {
    rank += 5; // 25001 to 100000: 5 points
  } else if (accountId >= 100001 && accountId <= 10000000) {
    rank += 1; // 100001 to 10000000: 1 point
  }


  // Username points
  const username = accountDetails.Username;
  const usernameLength = username.length;

  if (/[a-zA-Z]/.test(username)) {
    // Alphabetic username
    rank += 15; // Assign points for alphabetic username
  } else {
    // Numeric username
    rank += 15; // Assign points for numeric username
  }

  // Additional points based on the length of the username
  rank += (6 - usernameLength) * 10;

  return rank;
}



function fetchAccountInfo(username) {
  const url = `https://kick.com/api/v2/channels/${username}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not OK: ${response.status} (${response.statusText})`);
      }
      return response.json();
    })
    .then(data => {
      // Extract the desired information from the response
      const accountDetails = {
        Account_created_at: new Date(data.chatroom.created_at),
        Account_id: data.user.id,
        followers_count: data.followers_count,
        email_verified_at: new Date(data.user.email_verified_at),
        playback_url: data.playback_url,
        vod_enabled: data.vod_enabled,
        subscription_button: data.subscription_enabled,
        chat_mode: data.chatroom.chat_mode,
        Interval_between_Messages: data.chatroom.message_interval,
        Account_banned: data.is_banned,
        can_host: data.can_host,
        Muted_by_kick: data.muted,
        recent_categories: data.recent_categories.map(category => category.name),
        banner_image_url: data.banner_image ? data.banner_image.url : null,
        profile_pic: data.user.profile_pic, // Include the profile picture URL
        Username: data.user.username,
      };

      // Calculate rank
      const rank = calculateRank(accountDetails);
      const rankText = getRankText(rank);

      // Display the account details
      const accountDetailsElement = document.getElementById("account-details");
      accountDetailsElement.innerHTML = "";

      const detailOrder = [
        "Rank",
        "Username",
        "Account_id",
        "Account_created_at",
        "email_verified_at",
        "followers_count",
        "vod_enabled",
        "subscription_button",
        "chat_mode",
        "Interval_between_Messages",
        "Account_banned",
        "can_host",
        "Muted_by_kick",
        "recent_categories",
        "banner_image_url",
        "profile_pic", // Include profile picture URL in the detailOrder array
        "playback_url",
      ];

      for (const key of detailOrder) {
        const detailItem = document.createElement("p");
        const detailValue = accountDetails[key];

        if (key === "playback_url" || key === "banner_image_url" || key === "profile_pic") {
          if (detailValue !== null) {
            const link = document.createElement("a");
            link.href = detailValue;
            link.target = "_blank";
            link.innerText =
              key === "playback_url"
                ? "Playback URL (Must Be Live)"
                : key === "banner_image_url"
                ? "Banner Image URL"
                : "Profile Picture URL"; // Update the link text accordingly
            link.style.color = "#00E701"; // Set the link color to green
            detailItem.appendChild(link);
          } else {
            const text = key === "banner_image_url" || key === "profile_pic" ? "No " + key.replace(/_/g, " ").toUpperCase() : "";
            detailItem.innerText = text;
          }
        } else if (key === "recent_categories") {
          const formattedKey = formatAccountDetailKey(key);
          const formattedValue = detailValue.length > 0 ? detailValue.join(", ") : "None";
          detailItem.innerHTML = `<strong>${formattedKey}</strong>: ${formattedValue}`;
        } else if (key === "Rank") {
          detailItem.innerHTML = `<strong>${key}</strong>: ${rankText}`;
        } else {
          const formattedKey = formatAccountDetailKey(key);
          const formattedValue = formatAccountDetailValue(key, detailValue);
          detailItem.innerHTML = `<strong>${formattedKey}</strong>: ${formattedValue}`;
        }

        accountDetailsElement.appendChild(detailItem);
      }

      // Scroll to the account details section
      accountDetailsElement.scrollIntoView({ behavior: "smooth" });
    })
    .catch(error => {
      console.log("Error retrieving account information:", error);
    });
}

function formatAccountDetailKey(key) {
  const words = key.split("_");
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(" ");
}

function formatAccountDetailValue(key, value) {
  if (key.endsWith("_at")) {
    return value.toLocaleDateString() + " " + value.toLocaleTimeString();
  } else if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  } else if (typeof value === "number") {
    return value.toLocaleString();
  } else {
    return value;
  }
}

function getRankText(rank) {
  let rankText = "";
  let rankPoints = 0;
  let rankColor = ""; // New variable to store the rank color

  if (rank >= 50) {
    rankText = "Legendary";
    rankPoints = 50;
    rankColor = "red"; // Set rank color to red for "Legendary"
  } else if (rank >= 40) {
    rankText = "Epic";
    rankPoints = 40;
    rankColor = "purple"; // Set rank color to purple for "Epic"
  } else if (rank >= 30) {
    rankText = "Rare";
    rankPoints = 30;
    rankColor = "blue"; // Set rank color to blue for "Rare"
  } else if (rank >= 25) {
    rankText = "Uncommon";
    rankPoints = 25;
    rankColor = "green"; // Set rank color to green for "Uncommon"
  } else if (rank >= 15) {
    rankText = "Common";
    rankPoints = 15;
    rankColor = "orange"; // Set rank color to orange for "Common"
  } else {
    rankText = "Basic";
    rankPoints = 10;
    rankColor = "gray"; // Set rank color to gray for "Basic"
  }

  const glowingAnimation = `glowing 2s linear infinite`; // Define the glowing animation

  return `<span style="color: ${rankColor}; animation: ${glowingAnimation}">${rankText} (${rankPoints} points)</span>`;
}


// Event listener for the "Get Info" button
const getInfoButton = document.getElementById("get-info-button");
getInfoButton.addEventListener("click", () => {
  const usernameInput = document.getElementById("username-input");
  const username = usernameInput.value.trim();

  if (username !== "") {
    fetchAccountInfo(username);
  }
});
