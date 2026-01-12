
const fs = require('fs');

const topic7Answers = [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1]; // 1=B, 0=A
const topic14Answers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1];

const data = [
    {
        topic: "Land Law as Property: Introduction",
        questions: [
            "Property is deemed 'real' when the court:",
            "The indigenous system of land holding in Nigeria is:",
            "Customary law must be proved in court by:",
            "The 'Interpretation Act' definition of land is considered:",
            "'Stool land' belongs to:",
            "Who has the responsibility for repairs and maintenance of stool land?",
            "'Communal land' belongs to:",
            "'Virgin bush' or 'waste land' refers to communal land that is:",
            "Beach lands belong to:",
            "Title to minerals is vested in:",
            "The Latin maxim quic quid plantatur solo solo cedit means:",
            "Under Islamic law, does the quic quid rule apply?",
            "In Francis V. Ibitoye, a building erected on another's land without consent became property of:",
            "Which statute creates an exception to the quic quid rule for holders of a statutory right of occupancy?",
            "An 'incorporeal hereditament' is:",
            "How much space above the earth does a landowner own?",
            "Which case involved an aircraft taking photos and established limits on airspace rights?",
            "'Foreshores' belong to:",
            "A traditional ruler has which interest in 'stool land'?",
            "Under the Land Use Act, the radical title to land is vested in:"
        ],
        options: [
            ["Awards only money", "Restores the thing itself to the owner", "Punishes the thief", "Grants a license"],
            ["English Common Law", "Customary Land Tenure", "The Land Use Act", "Islamic Law"],
            ["Calling witnesses, books, or assessors", "Using the King’s writs", "Citing the 1978 Act", "Logical deduction only"],
            ["Extensive", "Restrictive (excludes minerals)", "Universal", "Obsolete"],
            ["The individual King", "The traditional office or 'stool'", "The Governor", "The first settler only"],
            ["The King personally", "The community (historically) or government (modernly)", "The Governor", "The tenants"],
            ["The Governor", "The community as an entity; individuals have only right of use", "The King absolutely", "The first person to farm it"],
            ["Owned by the Governor", "Uncultivated; the individual who clears it acquires an interest", "Forbidden to farm", "Used for ceremonies only"],
            ["The first fisherman", "The whole town, village, or community", "The Federal Government only", "Private developers"],
            ["The land owner", "The Federal Government", "The State Governor", "The Local Government"],
            ["Land belongs to the King", "Whatever is affixed to the soil becomes part of it", "First in time is stronger in law", "Equity follows the law"],
            ["Yes, always", "No; crops and buildings are separate from the land", "Only if the Governor says so", "Only in urban areas"],
            ["The builder", "The landowner", "The community", "The State"],
            ["Evidence Act", "Land Use Act (Section 15)", "Interpretation Act", "Wills Act"],
            ["A physical building", "An intangible right like an easement or profit", "A type of soil", "A customary chief"],
            ["Up to the stars", "Such space as is needed to make the land productive to a reasonable extent", "None; all air is public", "100 meters exactly"],
            ["Bernstein v. Skyviews Ltd", "Francis V. Ibitoye", "Amodu Tijani V. Southern Nigeria", "Idundun v. Okumagba"],
            ["The nearest family", "The State", "The Federal Government", "No one"],
            ["Fee simple", "No more than a life interest", "A 99-year lease", "Absolute ownership"],
            ["The President", "The Governor", "The Local Government", "The family head"]
        ],
        answers: topic7Answers
    },
    {
        topic: "Land Rights",
        questions: [
            "A 'right' is distinguished from a 'privilege' because a privilege is:",
            "Section 43 of the 1999 Constitution provides that every citizen has the right to:",
            "If a state law prevents Nigerians from accessing land, it is:",
            "A 'proprietary right' is best protected by:",
            "'De jure possession' means:",
            "'Title' connotes the existence of facts from which:",
            "According to Niki Tobi, an 'owner' is the:",
            "In England, all 'allodial ownership' is vested in:",
            "Under the Land Use Act, ownership in Nigeria is construed as:",
            "Which case listed the 5 main ways to establish ownership of land?",
            "Production of title documents older than 20 years gives rise to a presumption of due execution under the:",
            "The 'Contiguity Rule' suggests that the owner of adjacent land is:",
            "If two parties claim possession, the law ascribes it to:",
            "In Nigeria, an action to recover land by a private person is statute-barred after:",
            "'Adverse possession' must be nec vi, nec clam, nec precario, meaning:",
            "Does a customary land owner lose title to an adverse possessor under the Statute of Limitations?",
            "The rule in Akpan Awo v. Cookey Gam protects an adverse possessor if the owner:",
            "'Hauzi' in Islamic law refers to:",
            "Under the Land Use Act, we are all effectively:",
            "Is 'individual ownership' known to customary law?"
        ],
        options: Array(20).fill(["Option A", "Option B", "Option C", "Option D"]), // Placeholder, will fill details manually or use text
        answers: Array(20).fill(1)
    }
    // ... will complete this logic in the script or by writing the JSON directly
];

// Re-evaluating: I will just construct the JSON objects manually for the major ones as I have the text in prompt.
const finalJson = [];

function addBatch(topic, questionsText, optionsTexts, answers) {
    for (let i = 0; i < 20; i++) {
        finalJson.push({
            course: "Land Law",
            topic: topic,
            type: "objective",
            question_data: {
                text: questionsText[i],
                options: optionsTexts[i],
                correctAnswerIndex: answers[i],
                explanation: "Please refer to course materials for the detailed interpretation of this legal principle."
            }
        });
    }
}

// Construction starts...
// I'll skip the script and write the actual file for efficiency since I have the tool.
