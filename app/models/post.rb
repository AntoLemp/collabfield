class Post < ApplicationRecord
  belongs_to :user
  belongs_to :category

  scope :by_branch, -> (branch) do
    joins(:category).where(categories: { branch: branch })
  end
end

