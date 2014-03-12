import java.util.Arrays;
String city;

void setup() {
  size(700, 700);
  smooth();
  noFill();
 
  stroke(255, 0, 0);
  strokeWeight(1);
  background(25);
  city = "manhattan";
  city = "southwest-ohio";
  city = "washington";
  city = "miami";
  city = "southern-nevada";
  city = "los-angeles";
  
  
  city = "ulm";   
  //city = "san-diego";
  //city = "san-francisco";
  //city = "madrid";

 
  translate(50, 50);
  pushMatrix();
    drawRoute("7", #ffffff); // funicular
    drawRoute("6", #ffffff); // gondola
    drawRoute("5", #ffffff); // cable car
    drawRoute("4", #ffffff); // ferry
    drawRoute("3", #ff0000); // bus
    drawRoute("2", #ffffff); // rail, inter-city
    drawRoute("1", #ffffff); // subway, metro
    drawRoute("0", #0000ff); // tram
  popMatrix();
  
  save("../output/" + city + "/out.png"); 
}

void drawRoute(String type, color col) {
  String lines[] = loadStrings("../output/" + city + "/data.lines");
  String maxmin[] = loadStrings("../output/" + city + "/maxmin.lines");
 
  for (int i = 0; i < lines.length; i++) {
    String[] line = lines[i].split("\t");
    String trips =   line[0];
    if (float(trips) <= 0) trips = "1";
    String[] route_types = line[1].split(",");
    
    String[] points = line[2].split(",");

    strokeWeight(log(float(trips)) * 0.2f);
    //strokeWeight(float(trips) * 0.002f);
      
    float alph = 1.0 + (float(maxmin[0]) / float(trips));
    alph = 3.0f + log(float(trips)) * 0.7f;
    //alph = 3.0f + float(trips) * 0.018f;
    
    stroke(col, alph);    
             
    if (!Arrays.asList(route_types).contains(type) || route_types.length > 1)     
      continue;
  
    beginShape();
    for (int n = 0; n < points.length; n++) {
      if (points[n] == "" ) continue;

      String[] coords = new String[2];
      coords = points[n].split(" ");

      if (coords.length != 2) continue;
      
      vertex(float(coords[0]), float(coords[1]));
   
       //if (Arrays.asList(route_types).contains("3") && Arrays.asList(route_types).contains("0"))
       // stroke(0, 255, 0, alph);

      //if (Arrays.asList(route_types).contains("3") && route_types.length == 1)
      // line(float(pre[0]), float(pre[1]),  float(coords[0]), float(coords[1]) );
    }
    endShape();
  } 
}

void draw() { }
