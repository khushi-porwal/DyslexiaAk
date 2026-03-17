const History = require("../../models/History/History")

const analyzerUser = async (userId) => {
    const records = await History.find({userId});

    const report = {
        phonological: null,
        working_memory:null,
        grey_reading:null,
        rapid_writing: null
    };

    records.forEach(record=> {
        report[record.activityType] = {

        }
    })
}