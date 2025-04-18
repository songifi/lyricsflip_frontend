export interface LyricData {
    text: string;
    title: string;
    artist: string;
    options: SongOption[];
  }
  
  export interface SongOption {
    title: string;
    artist: string;
  }
  
  export const MOCK_LYRICS: LyricData[] = [
    {
      text: "I got a feeling that tonight's gonna be a good night",
      title: "I Gotta Feeling",
      artist: "The Black Eyed Peas",
      options: [
        { title: "I Gotta Feeling", artist: "The Black Eyed Peas" },
        { title: "Sweet Dreams", artist: "Eurythmics" },
        { title: "Party Rock Anthem", artist: "LMFAO" },
        { title: "Happy", artist: "Pharrell Williams" },
      ],
    },
    {
      text: "Cause all of me loves all of you, love your curves and all your edges",
      title: "All of Me",
      artist: "John Legend",
      options: [
        { title: "All of Me", artist: "John Legend" },
        { title: "Someone Like You", artist: "Adele" },
        { title: "Perfect", artist: "Ed Sheeran" },
        { title: "Stay With Me", artist: "Sam Smith" },
      ],
    },
    {
      text: "Sweet dreams are made of this, who am I to disagree?",
      title: "Sweet Dreams",
      artist: "Eurythmics",
      options: [
        { title: "Sweet Dreams", artist: "Eurythmics" },
        { title: "Bohemian Rhapsody", artist: "Queen" },
        { title: "Billie Jean", artist: "Michael Jackson" },
        { title: "Imagine", artist: "John Lennon" },
      ],
    },
    {
      text: "If I tell you say I love you, no dey lie",
      title: "Love Nwantiti",
      artist: "CKay",
      options: [
        { title: "Love Nwantiti", artist: "CKay" },
        { title: "Essence", artist: "Wizkid ft. Tems" },
        { title: "Peru", artist: "Fireboy DML" },
        { title: "Calm Down", artist: "Rema" },
      ],
    },
    {
      text: "You don’t need no other body",
      title: "Essence",
      artist: "Wizkid ft. Tems",
      options: [
        { title: "Essence", artist: "Wizkid ft. Tems" },
        { title: "Love Nwantiti", artist: "CKay" },
        { title: "Peru", artist: "Fireboy DML" },
        { title: "Calm Down", artist: "Rema" },
      ],
    },
    {
      text: "Peru, para, Peru, Peru, para",
      title: "Peru",
      artist: "Fireboy DML",
      options: [
        { title: "Peru", artist: "Fireboy DML" },
        { title: "Essence", artist: "Wizkid ft. Tems" },
        { title: "Love Nwantiti", artist: "CKay" },
        { title: "Calm Down", artist: "Rema" },
      ],
    },
    {
      text: "Baby, calm down, calm down, girl, this your body e put my heart for lockdown",
      title: "Calm Down",
      artist: "Rema",
      options: [
        { title: "Calm Down", artist: "Rema" },
        { title: "Peru", artist: "Fireboy DML" },
        { title: "Essence", artist: "Wizkid ft. Tems" },
        { title: "Love Nwantiti", artist: "CKay" },
      ],
    },
    {
      text: "Last last, na everybody go chop breakfast",
      title: "Last Last",
      artist: "Burna Boy",
      options: [
        { title: "Last Last", artist: "Burna Boy" },
        { title: "Soweto", artist: "Victony" },
        { title: "Rush", artist: "Ayra Starr" },
        { title: "Sability", artist: "Ayra Starr" },
      ],
    },
    {
      text: "I'm in love with the shape of you, we push and pull like a magnet do",
      title: "Shape of You",
      artist: "Ed Sheeran",
      options: [
        { title: "Shape of You", artist: "Ed Sheeran" },
        { title: "Perfect", artist: "Ed Sheeran" },
        { title: "Thinking Out Loud", artist: "Ed Sheeran" },
        { title: "Photograph", artist: "Ed Sheeran" },
      ],
    },
    {
      text: "I'm a sucker for you, say the word and I'll go anywhere blindly",
      title: "Sucker",
      artist: "Jonas Brothers",
      options: [
        { title: "Sucker", artist: "Jonas Brothers" },
        { title: "Cool", artist: "Jonas Brothers" },
        { title: "Only Human", artist: "Jonas Brothers" },
        { title: "What A Man Gotta Do", artist: "Jonas Brothers" },
      ],
    },
    {
      text: "I'm the bad guy, duh",
      title: "bad guy",
      artist: "Billie Eilish",
      options: [
        { title: "bad guy", artist: "Billie Eilish" },
        { title: "when the party's over", artist: "Billie Eilish" },
        { title: "everything i wanted", artist: "Billie Eilish" },
        { title: "lovely", artist: "Billie Eilish ft. Khalid" },
      ],
    },
    {
      text: "I'm a savage, classy, bougie, ratchet",
      title: "Savage",
      artist: "Megan Thee Stallion",
      options: [
        { title: "Savage", artist: "Megan Thee Stallion" },
        { title: "WAP", artist: "Cardi B ft. Megan Thee Stallion" },
        { title: "Hot Girl Summer", artist: "Megan Thee Stallion" },
        { title: "Body", artist: "Megan Thee Stallion" },
      ],
    },
    {
      text: "She a baddie, she know she a ten",
      title: "Baddie",
      artist: "Ice Spice",
      options: [
        { title: "Baddie", artist: "Ice Spice" },
        { title: "Munch", artist: "Ice Spice" },
        { title: "In Ha Mood", artist: "Ice Spice" },
        { title: "Princess Diana", artist: "Ice Spice" },
      ],
    },
    {
      text: "Yeah, you're lookin' at the truth, the money never lie, no",
      title: "I'm the One",
      artist: "DJ Khaled ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne",
      options: [
        { title: "I'm the One", artist: "DJ Khaled ft. Justin Bieber, Quavo, Chance the Rapper, Lil Wayne" },
        { title: "Wild Thoughts", artist: "DJ Khaled ft. Rihanna, Bryson Tiller" },
        { title: "No Brainer", artist: "DJ Khaled ft. Justin Bieber, Chance the Rapper, Quavo" },
        { title: "Popstar", artist: "DJ Khaled ft. Drake" },
      ],
    },
    {
      text: "I'm a bitch, I'm a boss, I'm a bitch and a boss, and I shine like gloss",
      title: "Boss Bitch",
      artist: "Doja Cat",
      options: [
        { title: "Boss Bitch", artist: "Doja Cat" },
        { title: "Say So", artist: "Doja Cat" },
        { title: "Kiss Me More", artist: "Doja Cat ft. SZA" },
        { title: "Need to Know", artist: "Doja Cat" },
      ],
    },
    {
      text: "Just gonna stand there and watch me burn, but that's alright because I like the way it hurts",
      title: "Love The Way You Lie",
      artist: "Eminem ft. Rihanna",
      options: [
        { title: "Love The Way You Lie", artist: "Eminem ft. Rihanna" },
        { title: "Umbrella", artist: "Rihanna" },
        { title: "Stan", artist: "Eminem ft. Dido" },
        { title: "The Monster", artist: "Eminem ft. Rihanna" },
      ],
    },
    {
      text: "I’m off the deep end, watch as I dive in, I’ll never meet the ground",
      title: "Shallow",
      artist: "Lady Gaga & Bradley Cooper",
      options: [
        { title: "Shallow", artist: "Lady Gaga & Bradley Cooper" },
        { title: "Always Remember Us This Way", artist: "Lady Gaga" },
        { title: "Million Reasons", artist: "Lady Gaga" },
        { title: "Perfect Illusion", artist: "Lady Gaga" },
      ],
    },
    {
      text: "You watch me bleed until I can’t breathe, shaking, falling onto my knees",
      title: "Stitches",
      artist: "Shawn Mendes",
      options: [
        { title: "Stitches", artist: "Shawn Mendes" },
        { title: "Treat You Better", artist: "Shawn Mendes" },
        { title: "There's Nothing Holdin' Me Back", artist: "Shawn Mendes" },
        { title: "Mercy", artist: "Shawn Mendes" },
      ],
    },
    {
      text: "I stay out too late, got nothing in my brain",
      title: "Shake It Off",
      artist: "Taylor Swift",
      options: [
        { title: "Shake It Off", artist: "Taylor Swift" },
        { title: "Blank Space", artist: "Taylor Swift" },
        { title: "Style", artist: "Taylor Swift" },
        { title: "You Belong With Me", artist: "Taylor Swift" },
      ],
    },
    {
      text: "I’m beginning to feel like a Rap God, Rap God",
      title: "Rap God",
      artist: "Eminem",
      options: [
        { title: "Rap God", artist: "Eminem" },
        { title: "Lose Yourself", artist: "Eminem" },
        { title: "Not Afraid", artist: "Eminem" },
        { title: "The Real Slim Shady", artist: "Eminem" },
      ],
    },
    {
      text: "You’re way too beautiful girl, that’s why it’ll never work",
      title: "Beautiful Girls",
      artist: "Sean Kingston",
      options: [
        { title: "Beautiful Girls", artist: "Sean Kingston" },
        { title: "Replay", artist: "Iyaz" },
        { title: "Fire Burning", artist: "Sean Kingston" },
        { title: "Let Me Love You", artist: "Mario" },
      ],
    },
    {
      text: "To the left, to the left, everything you own in the box to the left",
      title: "Irreplaceable",
      artist: "Beyoncé",
      options: [
        { title: "Irreplaceable", artist: "Beyoncé" },
        { title: "Halo", artist: "Beyoncé" },
        { title: "Single Ladies", artist: "Beyoncé" },
        { title: "Crazy in Love", artist: "Beyoncé ft. Jay-Z" },
      ],
    },
    {
      text: "My money don't jiggle jiggle, it folds",
      title: "Jiggle Jiggle",
      artist: "Duke & Jones & Louis Theroux",
      options: [
        { title: "Jiggle Jiggle", artist: "Duke & Jones & Louis Theroux" },
        { title: "Banana", artist: "Conkarah ft. Shaggy" },
        { title: "Laxed (Siren Beat)", artist: "Jawsh 685" },
        { title: "Savage Love", artist: "Jawsh 685 & Jason Derulo" },
      ],
    },
    {
      text: "This hit, that ice cold, Michelle Pfeiffer, that white gold",
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      options: [
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
        { title: "24K Magic", artist: "Bruno Mars" },
        { title: "Treasure", artist: "Bruno Mars" },
        { title: "Can't Stop the Feeling!", artist: "Justin Timberlake" },
      ],
    },
    {
      text: "You are my fire, the one desire",
      title: "I Want It That Way",
      artist: "Backstreet Boys",
      options: [
        { title: "I Want It That Way", artist: "Backstreet Boys" },
        { title: "Bye Bye Bye", artist: "*NSYNC" },
        { title: "Everybody (Backstreet's Back)", artist: "Backstreet Boys" },
        { title: "Tearin’ Up My Heart", artist: "*NSYNC" },
      ],
    },
    {
      text: "You see flames in my eyes, it burns so bright, I wanna stay forever",
      title: "Unstoppable",
      artist: "Sia",
      options: [
        { title: "Unstoppable", artist: "Sia" },
        { title: "Cheap Thrills", artist: "Sia" },
        { title: "Chandelier", artist: "Sia" },
        { title: "Elastic Heart", artist: "Sia" },
      ],
    },
    {
      text: "I'm the bad guy, duh",
      title: "bad guy",
      artist: "Billie Eilish",
      options: [
        { title: "bad guy", artist: "Billie Eilish" },
        { title: "bury a friend", artist: "Billie Eilish" },
        { title: "when the party's over", artist: "Billie Eilish" },
        { title: "Therefore I Am", artist: "Billie Eilish" },
      ],
    },
    {
      text: "I’m too hot (hot damn), call the police and the fireman",
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      options: [
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
        { title: "Finesse", artist: "Bruno Mars ft. Cardi B" },
        { title: "Locked Out of Heaven", artist: "Bruno Mars" },
        { title: "Don't Believe Me Just Watch", artist: "Bruno Mars" },
      ],
    },
    {
      text: "I ain't got no money, I ain't got no car to take you on a date",
      title: "My Humps",
      artist: "The Black Eyed Peas",
      options: [
        { title: "My Humps", artist: "The Black Eyed Peas" },
        { title: "Boom Boom Pow", artist: "The Black Eyed Peas" },
        { title: "Fergalicious", artist: "Fergie" },
        { title: "Hollaback Girl", artist: "Gwen Stefani" },
      ],
    },
    {
      text: "This one is for the boys with the booming system",
      title: "Super Bass",
      artist: "Nicki Minaj",
      options: [
        { title: "Super Bass", artist: "Nicki Minaj" },
        { title: "Anaconda", artist: "Nicki Minaj" },
        { title: "Starships", artist: "Nicki Minaj" },
        { title: "Bang Bang", artist: "Jessie J, Ariana Grande & Nicki Minaj" },
      ],
    },
  ];
  