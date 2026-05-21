pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Name configured in Jenkins Global Tool Configuration
    }

    environment {
        ALLURE_RESULTS = 'allure-results'
        ALLURE_REPORT = 'allure-report'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/shafinul98/allure-jenkins-demo.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npx wdio run ./wdio.conf.js'
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh 'npm run allure:generate'
            }
        }
    }

    post {

        always {

            // Archive allure report files
            archiveArtifacts artifacts: 'allure-report/**/*.*', allowEmptyArchive: true

            // Publish allure report in Jenkins
            allure([
                includeProperties: false,
                jdk: '',
                results: [[path: 'allure-results']]
            ])
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}