class Admin < ActiveRecord::Base
  belongs_to :user
  has_many :timeline_admins, dependent: :destroy
  has_many :timelines, through: :timeline_admins
end
 