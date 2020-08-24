import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'


const questionsDirectory = path.join(process.cwd(), 'questions')

export function getSortedQuestionsData() {
    const fileNames = fs.readdirSync(questionsDirectory);
    const allQuestionsData = fileNames.map(fileName => {
        const id = fileName.replace(/\.md$/, '')

        const fullPath = path.join(questionsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        const matterResult = matter(fileContents);

        return {
            ...matterResult.data,
            content: matterResult.content
        }
    });

    return allQuestionsData.sort((a, b) => {
        return a.id - b.id;
    });
}