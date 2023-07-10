/// <reference path='index.d.ts' />

const fs = require('fs');

class Questions {

    /**
     * @type {QCM[]}
     */
    QCM = [];

    /**
     * @type {true_or_false[]}
     */
    true_or_false = [];

    constructor() {

        const QCM_raw = this.load_QCM_questions();
        this.prepare_QCM_questions(QCM_raw);

        const true_or_false_raw = this.load_true_false_questions();
        this.prepare_true_false_questions(true_or_false_raw);

    }

    load_QCM_questions = () => fs.readFileSync('questions/QCM.txt').toString().replace(/\r/g, '');                  // stupid windows \r requirements

    load_true_false_questions = () => fs.readFileSync('questions/true_false.txt').toString().replace(/\r/g, '');    // stupid windows \r requirements


    /**
     * @param {string} rawData 
     */
    prepare_QCM_questions(rawData) {
        // const raw_arr = rawData.split(/(?=^\d+-)/gm).filter(item => item.trim()).map(item => item.trim().split('\n'));
        // this is the original solution, but what is used is the simplified version for whoever wants to understand the code better
        const raw_arr = rawData.split(/(?=^\d+-)/gm);   /* the expression `^\d+-` is used to match for a start of a line, along with any number of digits followed by a dash '-', this signifies that this is a start of a question
                                                        (?=...) is used for 'positive lookahead', used so that the matched digits like `1-`, `5-` or `43-` aren't removed by the .split() function, but are preserved instead */

        const refactored_rawArr = raw_arr.map(item => item.trim().split('\n').filter(innerItem => innerItem.trim()).map(innerItem => innerItem.trim()));    /*  .map() takes every element, and alters it in anyway needed
                                                                                                                In this example, each element `item` is being trimmed of any residue \n at the beginning and the end.
                                                                                                                split into an array by '\n', filtered from any empty elements with .filter(innerItem => innerItem.trim())
                                                                                                                and then mapped to trimmed elements with .map(innerItem => innerItem.trim())
                                                                                                                All this is unnecessary if the raw data in the files are already clean, but this is a good example of what to do if there are large data files to be filtered properly
                                                                                                                */


        refactored_rawArr.forEach(full_rawQuestion_arr => {
            // each element 'full_rawQuestion_arr' is an array that is of the form: [ question, answer, answer, answer, ... ]
            // the 'question' part contains the id, which is the number of the question in the beginning
            let [question, ...answers] = full_rawQuestion_arr;

            answers = answers.map(item => item.replace(/^[a-z]\) /g, ''))

            this.QCM.push(
                {
                    id: parseFloat(question.match(/^\d+/)[0]),                                                  // matches the 'id' number
                    question: question.split(/^\d+-/)[1].replace(/\.\.+|…+/g, '_________').trim(),                          // splits the question between 'id' and the question, and replaces all dots by '_' for blank words
                    answers: answers.map(item => item.replace(/-$/, '').trim()),
                    trueAnswers: answers.filter(item => item.match(/-$/g)).map(item => item.replace(/-$/, '').trim())
                }
            )

        })
    }

    /**
     * @param {string} rawData 
     */
    prepare_true_false_questions(rawData) {
        // const raw_arr = rawData.split(/(?=^\d+-)/gm).filter(item => item.trim()).map(item => item.trim().split('\n'));
        // this is the original solution, but what is used is the simplified version for whoever wants to understand the code better
        const raw_arr = rawData.split(/(?=^\d+.)/gm);   /* the expression `^\d+-` is used to match for a start of a line, along with any number of digits followed by a dash '-', this signifies that this is a start of a question
                                                        (?=...) is used for 'positive lookahead', used so that the matched digits like `1-`, `5-` or `43-` aren't removed by the .split() function, but are preserved instead 
                                                        */

        const refactored_rawArr = raw_arr.map(item => item.trim().split('\n').filter(innerItem => innerItem.trim()).map(innerItem => innerItem.trim().replace(/\.*$/g, '').trim()));

        refactored_rawArr.forEach(full_rawQuestion_arr => {

            const [question, ...answers] = full_rawQuestion_arr;
            const descriptions = answers.map(item => item.replace(/True|False|True.|False./, '').trim()).filter(item => item.trim());

            this.true_or_false.push(
                {
                    id: parseFloat(question.match(/^\d+/)[0]),                                                  // matches the 'id' number
                    question: question.split(/^\d+./)[1].trim(),                          // splits the question between 'id' and the question, and replaces all dots by '_' for blank words
                    answer: answers[0].includes('True'),
                    descriptions: descriptions
                }
            )

        })
    }

    refactor_HTML() {
        const rawHTML = fs.readFileSync('./rawHTML.html').toString();
        const beginning = rawHTML.split('// beginning of item')[0] + '\n';
        const end = '\n' + rawHTML.split('// end of item')[1];

        fs.writeFileSync('./build/index.html',
            beginning
            +
            'const QCM_questions = '
            +
            JSON.stringify(this.QCM, null, 2)
            +
            ';\nconst true_or_false_questions = '
            +
            JSON.stringify(this.true_or_false, null, 2)
            +
            ';\n'
            +
            end
        );
    }

}

const instance = new Questions();
module.exports = instance;