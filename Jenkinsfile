pipeline {
    agent any
    tools {
        nodejs 'Node Argon [4.6.0] + mocha, gulp, grunt, jasmine'
    }
    stages {
        stage('build') {
            steps {
                sh 'npm install --silent'
            }
        }
        stage('test') {
            steps {
                sh 'npm test'
            }
        }
        stage('publish [global npm]') {
            when {
                branch "master"
            }
            steps {
                sh 'gulp js:prod'

                sh 'npm set init.author.name "edmdesigner-bot"'
                sh 'npm set init.author.email "info@edmdesigner.com"'
                withCredentials([string(credentialsId: 'edmdesigner-bot', variable: 'NPM_AUTH_TOKEN')]) {
                    sh 'echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc'
                }
                sh 'npm publish'
            }
        }
    }
    post {
        always {
            cleanWs()
        }
        failure {
            slackSend color: 'danger', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
        }
        success {
            slackSend color: 'good', message: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
        }
        unstable {
            slackSend color: 'warning', message: "UNSTABLE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
        }
    }
}