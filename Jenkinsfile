@Library('jenkins-shared-library') _

def configMap = [
    project: "roboshop",
    component: "catalogue"
]

echo "Triggering the library pipeline"

if ( env.BRANCH_NAME.equalsIgnoreCase('main') ){
    /* configMap["jiraProject"] = "ROBO"
    EKSMainPipeline(configMap) */
    testPipeline(configMap)
}
else{
    testPipeline(configMap)
}