const Phonological = require("../../models/Phonological_Model/Phonological");

exports.submitPhonologicalTest = async (req, res) => {
  try {
    const {
      selectedWords,
      syllableCount,
      letterCount,
      firstSound,
      lastSound,
      blendedWord,
    } = req.body;

    // ✅ VALIDATIONS
    if (!selectedWords || !Array.isArray(selectedWords)) {
      return res.status(400).json({ message: "selectedWords must be an array" });
    }

    if (
      syllableCount === undefined ||
      letterCount === undefined ||
      !firstSound ||
      !lastSound ||
      !blendedWord
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Correct answers (same as frontend questions)
    const correctRhymes = ["cat", "hat", "mat"]; // rhymes with bat
    const correctSyllables = 3; // elephant (if you want elephant scoring)
    const correctLetters = 9;   // education has 9 letters ✅
    const correctFirstSound = "s"; // sun
    const correctLastSound = "sh"; // fish
    const correctBlendedWord = "dog"; // /d/ /o/ /g/

    let score = 0;

    // ✅ TASK 1: RHYME scoring (+1 each correct)
    const uniqueWords = [...new Set(selectedWords)];
    uniqueWords.forEach((word) => {
      if (correctRhymes.includes(word)) score += 1;
    });

    // ✅ TASK 2: syllable (+2)
    if (Number(syllableCount) === correctSyllables) score += 2;

    // ✅ TASK 3: letters (+2)
    if (Number(letterCount) === correctLetters) score += 2;

    // ✅ TASK 4: first sound (+2)
    if (String(firstSound).trim().toLowerCase() === correctFirstSound) score += 2;

    // ✅ TASK 5: last sound (+2)
    if (String(lastSound).trim().toLowerCase() === correctLastSound) score += 2;

    // ✅ TASK 6: blending (+2)
    if (String(blendedWord).trim().toLowerCase() === correctBlendedWord) score += 2;

    // ✅ Save into DB
    const result = await Phonological.create({
      selectedWords,
      syllableCount: Number(syllableCount),
      letterCount: Number(letterCount),
      firstSound,
      lastSound,
      blendedWord,
      score,
    });

    return res.status(200).json({
      message: "Phonological test submitted successfully ✅",
      score,
      result,
    });
  } catch (error) {
    console.log("❌ submitPhonologicalTest Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
