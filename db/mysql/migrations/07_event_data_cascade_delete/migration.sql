-- AlterTable
ALTER TABLE 
  event_data 
ADD 
  CONSTRAINT fk_website_event FOREIGN KEY (website_event_id) REFERENCES website_event(event_id) ON DELETE CASCADE;
