pipeline {
    agent any
    tools {
        nodejs 'Node 6.10.2'
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
                sh 'gulp build:prod'
                withNPM(npmrcConfig:'npmrc-global') {
                    sh 'npm publish'
                }
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
