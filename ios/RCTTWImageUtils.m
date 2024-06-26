//
//  RCTTWImageUtils.m
//  react-native-twilio-video-webrtc
//
//  Created by Christopher Fields II on 6/6/23.
//

#import <Foundation/Foundation.h>
#import "RCTTWImageUtils.h"

// https://stackoverflow.com/a/47402811/5434172
@implementation UIImage (Rotation)

- (UIImage *)rotate:(CGFloat)degrees {
    CGFloat radians = degrees * (M_PI / 180);
    CGRect newRect = CGRectApplyAffineTransform(CGRectMake(0, 0, self.size.width, self.size.height), CGAffineTransformMakeRotation(radians));
    CGSize newSize = CGSizeMake(floor(newRect.size.width), floor(newRect.size.height));
    
    UIGraphicsBeginImageContextWithOptions(newSize, NO, self.scale);
    CGContextRef context = UIGraphicsGetCurrentContext();
    
    CGContextTranslateCTM(context, newSize.width/2, newSize.height/2);
    CGContextRotateCTM(context, radians);
    
    [self drawInRect:CGRectMake(-self.size.width/2, -self.size.height/2, self.size.width, self.size.height)];
    
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return newImage;
}

@end
