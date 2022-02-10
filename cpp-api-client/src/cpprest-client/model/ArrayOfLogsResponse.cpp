/**
 * ALICE Bookkeeping
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 *
 * NOTE: This class is auto generated by OpenAPI-Generator 5.4.0.
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



#include "ArrayOfLogsResponse.h"

namespace org {
namespace openapitools {
namespace client {
namespace model {




ArrayOfLogsResponse::ArrayOfLogsResponse()
{
    m_DataIsSet = false;
    m_MetaIsSet = false;
}

ArrayOfLogsResponse::~ArrayOfLogsResponse()
{
}

void ArrayOfLogsResponse::validate()
{
    // TODO: implement validation
}

web::json::value ArrayOfLogsResponse::toJson() const
{

    web::json::value val = web::json::value::object();
    
    if(m_DataIsSet)
    {
        val[utility::conversions::to_string_t(U("data"))] = ModelBase::toJson(m_Data);
    }
    if(m_MetaIsSet)
    {
        val[utility::conversions::to_string_t(U("meta"))] = ModelBase::toJson(m_Meta);
    }

    return val;
}

bool ArrayOfLogsResponse::fromJson(const web::json::value& val)
{
    bool ok = true;
    
    if(val.has_field(utility::conversions::to_string_t(U("data"))))
    {
        const web::json::value& fieldValue = val.at(utility::conversions::to_string_t(U("data")));
        if(!fieldValue.is_null())
        {
            std::vector<std::shared_ptr<Log>> refVal_data;
            ok &= ModelBase::fromJson(fieldValue, refVal_data);
            setData(refVal_data);
        }
    }
    if(val.has_field(utility::conversions::to_string_t(U("meta"))))
    {
        const web::json::value& fieldValue = val.at(utility::conversions::to_string_t(U("meta")));
        if(!fieldValue.is_null())
        {
            std::shared_ptr<ArrayOfLogsResponseMeta> refVal_meta;
            ok &= ModelBase::fromJson(fieldValue, refVal_meta);
            setMeta(refVal_meta);
        }
    }
    return ok;
}

void ArrayOfLogsResponse::toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& prefix) const
{
    utility::string_t namePrefix = prefix;
    if(namePrefix.size() > 0 && namePrefix.substr(namePrefix.size() - 1) != utility::conversions::to_string_t(U(".")))
    {
        namePrefix += utility::conversions::to_string_t(U("."));
    }
    if(m_DataIsSet)
    {
        multipart->add(ModelBase::toHttpContent(namePrefix + utility::conversions::to_string_t(U("data")), m_Data));
    }
    if(m_MetaIsSet)
    {
        multipart->add(ModelBase::toHttpContent(namePrefix + utility::conversions::to_string_t(U("meta")), m_Meta));
    }
}

bool ArrayOfLogsResponse::fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& prefix)
{
    bool ok = true;
    utility::string_t namePrefix = prefix;
    if(namePrefix.size() > 0 && namePrefix.substr(namePrefix.size() - 1) != utility::conversions::to_string_t(U(".")))
    {
        namePrefix += utility::conversions::to_string_t(U("."));
    }

    if(multipart->hasContent(utility::conversions::to_string_t(U("data"))))
    {
        std::vector<std::shared_ptr<Log>> refVal_data;
        ok &= ModelBase::fromHttpContent(multipart->getContent(utility::conversions::to_string_t(U("data"))), refVal_data );
        setData(refVal_data);
    }
    if(multipart->hasContent(utility::conversions::to_string_t(U("meta"))))
    {
        std::shared_ptr<ArrayOfLogsResponseMeta> refVal_meta;
        ok &= ModelBase::fromHttpContent(multipart->getContent(utility::conversions::to_string_t(U("meta"))), refVal_meta );
        setMeta(refVal_meta);
    }
    return ok;
}

std::vector<std::shared_ptr<Log>>& ArrayOfLogsResponse::getData()
{
    return m_Data;
}

void ArrayOfLogsResponse::setData(const std::vector<std::shared_ptr<Log>>& value)
{
    m_Data = value;
    m_DataIsSet = true;
}

bool ArrayOfLogsResponse::dataIsSet() const
{
    return m_DataIsSet;
}

void ArrayOfLogsResponse::unsetData()
{
    m_DataIsSet = false;
}
std::shared_ptr<ArrayOfLogsResponseMeta> ArrayOfLogsResponse::getMeta() const
{
    return m_Meta;
}

void ArrayOfLogsResponse::setMeta(const std::shared_ptr<ArrayOfLogsResponseMeta>& value)
{
    m_Meta = value;
    m_MetaIsSet = true;
}

bool ArrayOfLogsResponse::metaIsSet() const
{
    return m_MetaIsSet;
}

void ArrayOfLogsResponse::unsetMeta()
{
    m_MetaIsSet = false;
}
}
}
}
}


