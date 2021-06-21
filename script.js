let pronouns;
const setPronouns = (value) => {
    pronouns = value;
};

let userPronounCache = [];

const getTimestmap = (time) => {
  if (time === undefined) {
    time = 0;
  }
  return ((new Date().getTime()) + (time * 60 * 60 * 1000))
}

const generatePronounBadge = (text) => {
    let textSpan = document.createElement('span');
    {
        textSpan.setAttribute('class', 'badge user-pronoun');
        textSpan.setAttribute('data-a-target', 'pr-badge-txt');
        textSpan.textContent = text;
    }
    return textSpan;
}

async function get(endpoint) {
    return await fetch("https://pronouns.alejo.io/api/" + endpoint).then(async (res) => {
        return res.json();
    });
}

async function getPronouns() {
    var res = await get("pronouns");
    var p = {};
    res.forEach((pronoun) => {
        p[pronoun.name] = pronoun.display;
    });
    return p;
}

async function getUserPronoun(username) {
    if (username.length < 1) {
        return;
    }
  	if (userPronounCache[username] !== undefined) {
      if (userPronounCache[username].expiry >= getTimestmap()) {
        return userPronounCache[username].pronoun_id
      }
    }
    var res = await get("users/" + username);
    let match = res.find((user) => {
        return user.login.toLowerCase() === username.toLowerCase();
    });
    userPronounCache[username] = {
        expiry: getTimestmap(5),
        pronoun_id: undefined,
    }
    if (match !== undefined) {
      	userPronounCache[username].pronoun_id = match.pronoun_id;
        return match.pronoun_id;
    }
}

// Please use event listeners to run functions.
document.addEventListener('onLoad', function(obj) {
	// obj will be empty for chat widget
	// this will fire only once when the widget loads
  console.log("Fetching pronouns");
  getPronouns().then(res => {
    setPronouns(res)
    console.log("Fetched pronouns");
  });
});

document.addEventListener('onEventReceived', function(obj) {
  	// obj will contain information about the event
  const username = obj.detail.from;
  if (username === "tmi.twitch.tv") {
    console.log("tmi.twitch.tv", obj);
    return;
  }
  if (username !== null) {
  	getUserPronoun(username.toLowerCase()).then(pronoun => {
      if (pronoun !== undefined) {
        console.log("pronouns for", obj.detail.from, "are", pronouns[pronoun], obj);
        document.querySelector(`div[data-id="${obj.detail.messageId}"] .meta .badges`).append(generatePronounBadge(pronouns[pronoun]))
      }
    });
  }
});