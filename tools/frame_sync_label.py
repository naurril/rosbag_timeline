import numpy as np
import json

input_timestamp_file = '../data.js'

with open(input_timestamp_file) as f:
    
    # consume line 1, so the remaining part is a json structure.
    line1 = f.readline()
    print(line1)

    stamps = json.load(f)


# /cameras/000_rear/image_color/compressed
# /cameras/000_rear/image_color/compressed_bag
# /cameras/070_rear_left/image_color/compressed
# /cameras/070_rear_left/image_color/compressed_bag
# /cameras/130_front_left/image_color/compressed
# /cameras/130_front_left/image_color/compressed_bag
# /cameras/180_front/image_color/compressed
# /cameras/180_front/image_color/compressed_bag
# /cameras/230_front_right/image_color/compressed
# /cameras/230_front_right/image_color/compressed_bag
# /cameras/290_rear_right/image_color/compressed
# /cameras/290_rear_right/image_color/compressed_bag
# /infrared_camera/front/image_color
# /infrared_camera/front/image_color_bag
# /infrared_camera/front_left/image_color
# /infrared_camera/front_left/image_color_bag
# /infrared_camera/front_right/image_color
# /infrared_camera/front_right/image_color_bag
# /infrared_camera/rear_left/image_color
# /infrared_camera/rear_left/image_color_bag
# /infrared_camera/rear_right/image_color
# /infrared_camera/rear_right/image_color_bag
# /pandar_points
# /pandar_points_bag
# /rsbp_left/rslidar_points
# /rsbp_left/rslidar_points_bag
# /rsbp_rear/rslidar_points
# /rsbp_rear/rslidar_points_bag


raw_topics = stamps["topics"]


# build a map, for convenient indexing
topics  = {}
for t in raw_topics:
    topics[t["name"]] = t


# main lidar, as reference timeline
main_lidar = topics["/pandar_points"]["stamps"]

# printout info of main lidar
time_dur = main_lidar[-1] - main_lidar[0]
print('main lidar has', len(main_lidar), 'frames,', time_dur, 'seconds')



cfg = {
    "/cameras/000_rear/image_color/compressed": 0,
    "/cameras/070_rear_left/image_color/compressed": 70/3600,
    "/cameras/130_front_left/image_color/compressed": 130/3600,
    "/cameras/180_front/image_color/compressed": 180/3600,
    "/cameras/230_front_right/image_color/compressed": 230/3600,
    "/cameras/290_rear_right/image_color/compressed": 290/3600,
}

for c in cfg:
    print(c)
    delta = cfg[c]
    # generate image ref timestamp
    # each camera has different ref-timeline
    img_ref_timeline = (np.array(main_lidar) + delta).reshape([1,-1])
    target = np.array(topics[c]["stamps"]).reshape([-1,1])
    time_diff = np.abs(img_ref_timeline - target)
    min_diff_idx = np.argmin(time_diff, axis=1)
    print(min_diff_idx)
    topics[c]["index"] = min_diff_idx.tolist()


with open("data-indexed.js",'w') as f:
    f.write("var data_indexed = \n")
    json.dump(stamps, f)