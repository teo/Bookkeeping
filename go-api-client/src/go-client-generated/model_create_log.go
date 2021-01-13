/*
 * ALICE Bookkeeping
 *
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * API version: 0.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package swagger

// Describes an intervention or an event that happened.
type CreateLog struct {
	Attachments *[]Attachment `json:"attachments,omitempty"`
	ParentLogId int64 `json:"parentLogId,omitempty"`
	Text string `json:"text"`
	Title string `json:"title"`
	RunNumbers string `json:"runNumbers,omitempty"`
}
