locals {
  s3_origin_id = "mymollu-assets"
}

resource "aws_cloudfront_origin_access_control" "cloudfront-s3" {
  name                              = "CloudFront S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "assets" {
  depends_on = [ data.aws_acm_certificate.mollulog-net ]

  comment         = "MolluLog Assets"
  enabled         = true
  is_ipv6_enabled = true
  aliases         = [ "assets.mollulog.net" ]

  origin {
    domain_name              = aws_s3_bucket.assets-bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.cloudfront-s3.id
    origin_id                = local.s3_origin_id
  }

  origin {
    domain_name = "baql.mollulog.net"
    origin_id   = "baql-mollulog-net"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols   = ["SSLv3"]
      origin_protocol_policy = "https-only"
    }
  }

  default_cache_behavior {
    cache_policy_id  = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # Managed-CachingOptimized
    target_origin_id = local.s3_origin_id
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]

    viewer_protocol_policy = "https-only"
    compress               = true

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  ordered_cache_behavior {
    path_pattern     = "/images/*"

    cache_policy_id  = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # Managed-CachingOptimized
    target_origin_id = "baql-mollulog-net"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]

    viewer_protocol_policy = "https-only"
    compress               = true

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.mollulog-net.arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  tags = {
    Service = "mollulog"
  }
}
