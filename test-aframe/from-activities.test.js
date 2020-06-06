/* public/sum.test.js */

sample = 
`<camelContext id="camel" xmlns="http://camel.apache.org/schema/spring">

    <route id="route1">
      <from uri="direct:route1" id="direct-1"/>
    </route>
  
</camelContext>`


sampleKafka = 
`<camelContext id="camel" xmlns="http://camel.apache.org/schema/spring">

    <route id="route1">
      <from uri="kafka:topic1?brokers=YOUR_BROKER_SERVICE_URI" id="from-1"/>
    </route>
  
</camelContext>`



var normaliseXml = function(sourceXml)
{
    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    var xsltDoc = new DOMParser().parseFromString([
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"',
      '    version="1.0">',
      '    <xsl:template match="@*|node()">',
      '        <xsl:copy>',
      '            <xsl:apply-templates select="@*|node()"/>',
      '        </xsl:copy>',
      '    </xsl:template>',
      '    <xsl:template match="text()"><xsl:value-of select="normalize-space(.)"/> </xsl:template>',
      '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();    
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};

var prettifyXml = function(sourceXml)
{
    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    var xsltDoc = new DOMParser().parseFromString([
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:output omit-xml-declaration="yes" indent="yes"/>',
        '    <xsl:template match="node()|@*">',
        '      <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '    </xsl:template>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();    
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};


describe('#sum()', function() {

    beforeEach(function() {
        // some logic to run before each test
        // logic can be sync or async
        // createDirect()
      console.log("log before each")
      resetDesigner()
    })

    context('From Direct', function() {
    
        it('should render a route with a Direct activity', function() {
          console.log('test log 1')

          createDirectStart()
          
          let mycode = {text:"", tab:""};

          renderCamelContext(mycode);


          var truth  = new DOMParser().parseFromString(sample,     "text/xml").documentElement.outerHTML
          var result = new DOMParser().parseFromString(mycode.text,"text/xml").documentElement.outerHTML

          //removes all tabs and spaces
          truth = normaliseXml(truth)
          result = normaliseXml(result)

          //pretty-prints for readability
          truth = prettifyXml(truth)
          result = prettifyXml(result)

          console.log("expect: \n"+truth)
          console.log("equal: \n"+result)
          
          expect(result).to.equal(truth)
        })        
      })

      context('From Kafka', function() {
    
        it('should return sum of arguments', async function() {
          console.log('test log 1')

          createKafkaStart()
          
          let mycode = {text:"", tab:""};

          renderCamelContext(mycode);


          var truth  = new DOMParser().parseFromString(sampleKafka,"text/xml").documentElement.outerHTML
          var result = new DOMParser().parseFromString(mycode.text,"text/xml").documentElement.outerHTML

          //removes all tabs and spaces
          truth = normaliseXml(truth)
          result = normaliseXml(result)

          //pretty-prints for readability
          truth = prettifyXml(truth)
          result = prettifyXml(result)

          console.log("expect: \n"+truth)
          console.log("equal: \n"+result)
          
          expect(result).to.equal(truth)
        })        
      })

      // context('test 2', function() {
      //   it('should return true', function() {
      //     console.log('test2')          
      //     expect("true").to.equal("tdrue")
      //   })
      // })

      this.afterAll(async function(){
        // await utils.after()
        console.log('ROOT AFTER')

        let scene = document.querySelector('#designer')
        scene.parentNode.removeChild(scene)
      }) 

  })