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
          created_at: new Date(data.chatroom.created_at),
          user_id: data.user.id,
          followers_count: data.followers_count,
          email_verified_at: new Date(data.user.email_verified_at),
          playback_url: data.playback_url,
          vod_enabled: data.vod_enabled,
          subscription_enabled: data.subscription_enabled,
          chat_mode: data.chatroom.chat_mode,
          message_interval: data.chatroom.message_interval,
          is_banned: data.is_banned,
          can_host: data.can_host,
          muted: data.muted,
        };
  
        // Display the account details
        const accountDetailsElement = document.getElementById("account-details");
        accountDetailsElement.innerHTML = "";
  
        const detailOrder = [
          "user_id",
          "created_at",
          "email_verified_at",
          "followers_count",
          "vod_enabled",
          "subscription_enabled",
          "chat_mode",
          "message_interval",
          "is_banned",
          "can_host",
          "muted",
          "playback_url",
        ];
  
        for (const key of detailOrder) {
          const detailItem = document.createElement("p");
          const detailValue = accountDetails[key];
  
          if (key === "playback_url") {
            const link = document.createElement("a");
            link.href = detailValue;
            link.target = "_blank";
            link.innerText = "Playback URL (Shortened Link)";
            link.style.color = "#00E701"; // Set the link color to green
            detailItem.appendChild(link);
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
    } else {
      return value.toString();
    }
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
  