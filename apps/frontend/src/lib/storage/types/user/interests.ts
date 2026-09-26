import { z } from "zod";

const vanillaInterests: string[] = [
  // Arts & Crafts
  'animation', 'arts', 'beadwork and beading', 'blacksmithing', 'book making', 'brass rubbing', 'calligraphy', 'cameras', 'candle making', 'crafts', 'crochet', 'cross stitch', 'doll making', 'drawing and sketching', 'embroidery', 'enamels', 'engraving', 'figure painting', 'floral arranging', 'glass blowing', 'graphic design', 'greeting card making', 'jewellery making', 'knitting', 'lace making', 'leather crafting', 'macramé', 'making collages', 'making crafts', 'making musical instruments', 'map making', 'marquetry', 'mosaics', 'needle point', 'needle work', 'origami', 'painting and drawing', 'paper dioramas (tatebanko)', 'paper making', 'papier mache', 'pastel drawing', 'photography', 'picture framing', 'pottery', 'quilling', 'quilting', 'scrap-booking', 'sculpture', 'sewing', 'shadow boxes', 'sketching', 'soap-making', 'splatter painting', 'stain glass', 'tie dying', 'tombstone rubbing', 'underwater photography', 'watercolour', 'weaving', 'wire jewellery making', 'wood carving', 'woodworking',

  // Performing Arts & Music
  'acting', 'amateur theatre', 'ballet', 'ballet dancing', 'belly dancing', 'composing music', 'dancing', 'djing', 'film making', 'juggling', 'karaoke', 'learn an instrument', 'listening to music', 'magic tricks', 'music', 'music production', 'opera', 'performing arts', 'playing music', 'playing musical instruments', 'puppet theatre', 'singing', 'stand-up comedy', 'theater', 'playing violin', 'playing piano', 'fashion consulting',

  // TODO: add more instrument options

  // Sports & Fitness
  'aerobics', 'badminton', 'baseball/softball', 'basketball', 'bike riding', 'body building', 'bouldering', 'bowls', 'boxing', 'bungee jumping', 'clay pigeon shooting', 'climbing', 'cricket', 'curling', 'cycling', 'diving', 'fencing', 'fitness/ gym', 'football', 'frisbee', 'golfing', 'hang gliding', 'hockey', 'horse riding', 'hula hooping', 'ice-skating', 'jogging/ running', 'martial arts', 'mountain biking', 'mountain climbing', 'paintballing', 'para-gliding', 'parachuting', 'polo', 'rock climbing', 'roller skating', 'rowing', 'rugby', 'scuba diving', 'shooting', 'skateboarding', 'skating', 'skiing', 'skydiving', 'snorkelling', 'snowboarding', 'soccer', 'sports & outdoors hobbies', 'surfing', 'swimming', 'sword fighting', 'table tennis', 'ten pin bowling', 'tennis', 'trampolining', 'volleyball', 'water aerobics', 'weight lifting', 'windsurfing', 'road-biking', 'trail-running',

  // Outdoor & Nature
  'backpacking', 'beekeeping', 'bird watching (ornithology)', 'bonsai', 'cacti', 'camping', 'canoeing', 'caravanning', 'caving', 'fishing', 'fly fishing', 'flying kites', 'foraging', 'gardening and plants hobbies', 'geocaching', 'hiking', 'hot air ballooning', 'hothouse gardening', 'house plants', 'hunting', 'hydroponics', 'kayaking', 'kite flying', 'nature walking', 'orchid raising', 'organic gardening', 'orienteering', 'rafting/canoeing', 'sailing', 'spelunking', 'stargazing', 'terrariums', 'train spotting', 'urban exploration', 'walking and hiking',

  // Collecting
  'antiques', 'arrow heads', 'autographs', 'bottles', 'business cards', 'butterflies', 'calendars', 'candles', 'clocks', 'coin collecting', 'collecting music', 'collecting postcards', 'collecting things', 'collecting vinyl records', 'comic books', 'crystals', 'currency', 'fossils', 'fountain pens', 'insects', 'knives', 'memorabilia', 'patches', 'postcards', 'posters', 'rock collecting', 'rocks & minerals', 'snow globes', 'sports cards', 'stamp collecting', 'stamps', 'swords', 'teddy bears', 'terry bears', 'toys',

  // Games & Puzzles
  'board games', 'chess', 'classic video games', 'computer games', 'crossword puzzles', 'darts', 'dominoes', 'escape rooms', 'jigsaw puzzles', 'pinball machines/ arcade games', 'playing cards', 'playing chess or backgammon etc.', 'playing computer games', 'pool', 'quiz nights', 'scrabble', 'sudoku', 'trivia',

  // Food & Drink
  'baking', 'barbecue and grilling', 'cake making and decorating', 'coffee brewing', 'cooking', 'food gardening', 'food related hobbies', 'healthy eating', 'home brewing – wine/ beer/ mead', 'home canning and jarring', 'kitchen chemistry', 'mixology', 'wine tasting',

  // Animals & Pets
  'animal breeding', 'animal communication', 'animal rescuing', 'aquarium', 'dog breeding', 'dog training', 'falconry', 'fish keeping', 'hobbies relating to animals', 'looking after a pet', 'pigeon racing', 'vivariums',

  // Home & DIY
  'do it yourself', 'gunsmith', 'home automation', 'home theatre', 'interior design', 'restoring antiques', 'various' +
  ' home repairs',

  // Vehicles & Motorsports
  'car restoration', 'driving', 'formula 1', 'four wheeling', 'go karts', 'motor biking',

  // Technology & Science
  '3d printing', 'amateur and ham radio', 'app development', 'astronomy', 'building circuits', 'cb radio', 'coding', 'computers', 'electronic hobbies', 'imaging', 'internet surfing', 'lasers', 'making telescopes', 'microscopy', 'physics demonstrations', 'robotics', 'science (amateur)', 'telescope making', 'programmable cryptography', 'dweb', 'biohacking', 'quantified self',

  // Models, Miniatures & Building
  'dioramas', 'dollhouses', 'making dollhouses', 'miniature figures', 'model aircraft', 'model airplanes', 'model figures', 'model railroads', 'model rockets', 'model ships', 'model trains', 'model yachts', 'paper models', 'r/c boats', 'r/c cars', 'r/c helicopters', 'r/c planes', 'scale model building hobbies', 'scale models', 'war game terrain making',

  // Reading, Writing & Learning
  'blogging', 'books', 'creative writing', 'diary keeping and journaling', 'history', 'languages', 'newspapers', 'philosophy', 'podcasting', 'poetry reading', 'psychology', 'quotes', 'reading', 'religions', 'storytelling', 'writing', 'writing poetry', 'literature',

  // Academic Subjects
  'computational neuroscience', 'computational biology', 'synthetic biology',

  // Mind, Body & Spirituality
  'astrology', 'ghost hunting', 'hypnosis', 'magic and the occult', 'meditation', 'natural remedies', 'palmistry', 'reflexology', 'tarot', 'yoga', 'embodiment', 'authentic relating practices', 'hot springs', 'massage', 'tea',

  // Social & Lifestyle
  'battle re-enactment', 'child care', 'cinema', 'cosmetics', 'fashion', 'going to gigs', 'movies', 'people watching', 'socialising', 'thrifting', 'travelling and exploring new places', 'volunteering', 'watching tv',

  // Politics, volunteering
  'civil tech', 'coliving', 'coliving organizing', 'grassroots campaigning and organizing', 'running social' +
  ' experiments',

  // Finances
  'FIRE', 'day-trading', 'cryptocurrency', 'web3'
];

const spicyInterests: string[] = [
  // True crime & dark curiosities
  'true crime obsession', 'serial killer fan mail / true crime fandom culture', 'cults & documentaries about them', 'death positivity movement (green burials, memento mori)', 'forensic science hobbyism', 'cold case armchair detective work', 'collecting murderabilia', 'studying cult recruitment tactics', 'disaster & catastrophe documentaries', 'morgue / mortuary science fascination', 'poisons & toxicology trivia', 'old execution methods & prison history', 'reading autopsy reports for fun',

  // Occult, paranormal & fringe belief
  'tarot & the occult', 'astrology (unironically)', 'ghost hunting / paranormal investigation', 'cryptid & ufo research', 'conspiracy theories', 'witchcraft / modern paganism', 'numerology', 'demonology folklore study', 'flat earth debate (as a hobby, not belief)', 'past life regression sessions', 'ouija board collecting', 'alien abduction lore', 'urban legend chasing',

  // Risk, danger & adrenaline
  'extreme sports (base jumping, free solo climbing)', 'hunting', 'rage rooms', 'illegal street racing fandom', 'fight clubs / underground boxing', 'storm chasing', 'abandoned building exploration (urbex)', 'cliff diving', 'fire breathing / fire performance', 'off-grid van life in questionable locations', 'free diving', 'motorcycle stunt riding', 'competitive arm wrestling', 'pain play',

  // Collecting the unusual
  'taxidermy', 'knife / weapon collecting', 'vintage weapons or militaria collecting', 'collecting vintage medical instruments', 'insect & bug collecting/pinning', 'roadkill art / bone collecting', 'antique mortuary equipment', 'retired sideshow / carnival memorabilia', 'collecting historical propaganda posters', 'preserved specimens in jars (wet specimens)', 'old psychiatric hospital artifacts', 'vintage sex toys / erotica antiques',

  // Vice, excess & controversial lifestyle
  'competitive gambling / poker', 'casino / sports betting strategy', 'amateur mixology / heavy drinking culture', 'cigar & pipe collecting', 'competitive eating', 'mlm skepticism (or participation)', 'swinger lifestyle / non-monogamy advocacy', 'polyamory community organizing', 'sugar dating culture commentary', 'vaping cloud competitions', 'guerrilla play', 'guerrilla clowning',

  // Kink & BDSM community
  'kink / bdsm community involvement', 'rope bondage / shibari as an art form', 'munch attendance (local kink' +
  ' meetups)', 'dominant/submissive dynamics & power exchange', 'impact play technique & gear collecting', 'fetish' +
  ' fashion & latex/leather craftsmanship', 'kink convention attendance', 'sensation play (wax, temperature,' +
  ' texture)', 'collar & protocol relationship structures', 'burlesque / fetish performance art', 'shibari',

  // Drugs & psychedelia
  'underground rave / drug culture anthropology', 'psychedelic-assisted therapy advocacy', 'microdosing discourse', 'cannabis cultivation as a hobby', 'entheogen & shamanic tradition research', 'psychedelic art & visionary painting', 'festival / burner culture involvement', 'legalization & drug policy activism', 'home cultivation of psilocybin mushrooms (where legal)', 'kratom & nootropics enthusiast culture', 'ayahuasca retreat tourism', 'collecting vintage drug paraphernalia', 'djing / production for psytrance scenes', 'psychodelics', 'ritual psychodelics',

  // Body & aesthetic extremes
  'body modification (extreme piercings, tattoos, scarification)', 'extreme fasting / competitive dieting culture', 'suspension (body hook suspension art)', 'corseting / extreme waist training', 'competitive bodybuilding (steroid discourse included)', 'tongue splitting & subdermal implants', 'extreme cosmetic surgery fandom', 'furry fandom (fursuiting)',

  // Contrarian, provocative & online
  'dark humor & morbid jokes', 'internet trolling as a hobby', 'debate over controversial political topics', 'doomsday prepping / survivalism', 'poaching debates & controversial wildlife management', 'edgy stand-up comedy writing', 'shock content creation (for laughs, not harm)', 'cancel culture commentary / hot takes', 'running provocative anonymous social accounts', 'debunking (or defending) urban myths aggressively',

  // Horror & macabre fandom
  'horror movie superfandom', 'slasher franchise completionism', 'haunted house design / scare acting', 'gore' +
  ' effects & practical fx makeup', 'extreme metal / horrorcore music scenes', 'collecting horror movie props/replicas', 'writing creepypasta', 'escape room / horror escape design',

  // Whimsy and weird
  `taking over the world`, 'death doula', 'hospice care'
];

export const availableInterests = [...vanillaInterests, ...spicyInterests];

export const InterestsSchema = z.array(z.string());

export type interests = z.infer<typeof InterestsSchema>;