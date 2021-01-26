
#include <sstream>
#include <rosbag/bag.h>
#include <rosbag/view.h>

#include <sensor_msgs/Image.h>
#include <sensor_msgs/CompressedImage.h>
#include <sensor_msgs/PointCloud2.h>

#include <stdlib.h>

typedef sensor_msgs::PointCloud2 PointCloud;
typedef PointCloud::ConstPtr PointCloudConstPtr;


int main (int argc, char** argv)
{
  if (argc < 2)
  {
    std::cerr << "Syntax is: " << argv[0] << " <file_in.bag>" << std::endl;
    std::cerr << "Example: " << argv[0] << " data.bag " << std::endl;
    return (-1);
  }

  rosbag::Bag bag;
  
  try
  {
    bag.open (argv[1], rosbag::bagmode::Read);
  } 
  catch (rosbag::BagException) 
  { 
    std::cerr << "Error opening file " << argv[1] << std::endl;
    return (-1);
  }


  rosbag::View view(bag);
  rosbag::View::iterator view_it;

  std::vector<const rosbag::ConnectionInfo *> connection_infos = view.getConnections();
  std::vector<std::string> topics;

  for(auto conn_info: connection_infos)
  {
    std::cout<< conn_info->topic <<std::endl;
    topics.push_back(conn_info->topic);
  }

  typedef std::list<ros::Time> StampList;
  std::map<std::string, StampList> stamp_cache;


  for (auto topic: topics)
  {
    stamp_cache[topic] = StampList();
  }

  view_it = view.begin ();

  while (view_it != view.end ())
  {

    auto topic =  view_it->getTopic();
    //std::cout<<topic<<std::endl;
    //std::cout<<"timestame in view "<<view_it->getTime()<<std::endl;

    sensor_msgs::CompressedImageConstPtr img_compressed = view_it->instantiate<sensor_msgs::CompressedImage> ();
    if (img_compressed != NULL){
       stamp_cache[topic].push_back(img_compressed->header.stamp);
       //std::cout<<"timestame in pack "<<img_compressed->header.stamp<<std::endl;
    }

    sensor_msgs::ImageConstPtr img = view_it->instantiate<sensor_msgs::Image> ();
    if (img != NULL)
    {
      stamp_cache[topic].push_back(img->header.stamp);
      //std::cout<<"timestame in pack "<<img->header.stamp<<std::endl;
    }
    
    PointCloudConstPtr cloud = view_it->instantiate<PointCloud> ();
    if (cloud != NULL)
    {
      stamp_cache[topic].push_back(cloud->header.stamp);
      //std::cout<<"timestame in pack " << cloud->header.stamp<<std::endl;
    }
   
    
    ++view_it;
  }

  // write json
  std::ofstream of("./data.js");

  of << "var topics = {";

  for (auto topic: topics)
  {
    auto stamps = stamp_cache[topic];

    of << "\"" << topic << "\":" << "[";
    for (auto st: stamps){
      of << st <<',';
    }
    of << "],";
  }

  of <<"};";

  of.close();

  return (0);
}


